import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  sendChatCompletion,
  buildUserContext,
  generateSuggestedQuestions,
  getStarterQuestions,
  SYSTEM_PROMPT,
} from '@/lib/api/openai';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

export default function AskScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
    loadStarterQuestions();
  }, []);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadStarterQuestions = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('hormone_tests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const questions = getStarterQuestions({ testsCount: count || 0 });
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Error loading starter questions:', error);
      setSuggestedQuestions(getStarterQuestions());
    }
  };

  const fetchComprehensiveUserData = async () => {
    if (!user) return {};

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('age, gender, goals, on_hormone_therapy')
        .eq('id', user.id)
        .single();

      // Fetch recent tests (last 10)
      const { data: tests } = await supabase
        .from('hormone_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      // Fetch latest ReadyScore
      const { data: readyScores } = await supabase
        .from('ready_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);

      // Fetch latest BioAge
      const { data: bioAges } = await supabase
        .from('bio_ages')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1);

      // Fetch Impact analyses
      const { data: impacts } = await supabase
        .from('impact_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(5);

      // Fetch active protocols
      const { data: protocols } = await supabase
        .from('user_protocols')
        .select('*, protocol:protocols(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      return {
        userProfile: profile || undefined,
        recentTests: tests || [],
        readyScore: readyScores?.[0]?.score,
        readyScoreDetails: readyScores?.[0],
        bioAge: bioAges?.[0]?.biological_age,
        bioAgeDetails: bioAges?.[0],
        impactAnalyses: impacts || [],
        activeProtocols: protocols || [],
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {};
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || !user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setSuggestedQuestions([]); // Clear suggestions while loading

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Fetch comprehensive user data
      const userData = await fetchComprehensiveUserData();
      const contextString = buildUserContext(userData);

      // Build conversation history
      const conversationHistory = messages
        .slice(-4) // Last 4 messages for context
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Send to GPT-4
      const response = await sendChatCompletion({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `User's current data:\n${contextString}` },
          ...conversationHistory,
          { role: 'user', content: textToSend },
        ],
      });

      // Add assistant message to UI
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save both messages to database
      await supabase.from('chat_messages').insert([
        {
          user_id: user.id,
          role: 'user',
          content: textToSend,
          context_provided: { userData: contextString },
        },
        {
          user_id: user.id,
          role: 'assistant',
          content: response.reply,
        },
      ]);

      // Generate suggested questions
      const conversationContext = `User: ${textToSend}\nAssistant: ${response.reply}`;
      const suggestions = await generateSuggestedQuestions(conversationContext, contextString);
      setSuggestedQuestions(suggestions);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send message. Please check your internet connection and try again.'
      );

      // Remove the user message if failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(question);
    handleSendMessage(question);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loadingData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading your coach...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🤖</Text>
          <View>
            <Text style={styles.headerTitle}>ASK™</Text>
            <Text style={styles.headerSubtitle}>AI Hormone Coach</Text>
          </View>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyTitle}>Welcome to your AI Coach!</Text>
            <Text style={styles.emptyText}>
              I have access to all your test results, patterns, and insights. Ask me anything about
              your hormones!
            </Text>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerIcon}>ℹ️</Text>
              <Text style={styles.disclaimerText}>
                For general wellness only. Not medical advice. Consult healthcare providers for
                medical concerns.
              </Text>
            </View>
          </View>
        )}

        {messages.map((message, index) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {message.role === 'assistant' && <Text style={styles.assistantIcon}>🤖</Text>}
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.assistantIcon}>🤖</Text>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
            </View>
          </View>
        )}

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && !loading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Suggested questions:</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionPill}
                onPress={() => handleSuggestedQuestion(question)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{question}</Text>
                <Text style={styles.suggestionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your hormones..."
            placeholderTextColor={DesignSystem.colors.neutral[400]}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendIcon}>{loading ? '⏳' : '↑'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DesignSystem.spacing[4],
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[200],
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[900],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[3],
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: DesignSystem.spacing[6],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[12],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing[4],
  },
  emptyTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
    marginBottom: DesignSystem.spacing[6],
    paddingHorizontal: DesignSystem.spacing[8],
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    marginHorizontal: DesignSystem.spacing[6],
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.primary[500],
  },
  disclaimerIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing[2],
  },
  disclaimerText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.relaxed,
  },
  messageBubble: {
    marginBottom: DesignSystem.spacing[4],
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.radius.xl,
    borderBottomRightRadius: DesignSystem.radius.sm,
    padding: DesignSystem.spacing[4],
    ...DesignSystem.shadows.sm,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    borderBottomLeftRadius: DesignSystem.radius.sm,
    padding: DesignSystem.spacing[4],
    ...DesignSystem.shadows.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  assistantIcon: {
    fontSize: 20,
    marginBottom: DesignSystem.spacing[2],
  },
  messageText: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  userText: {
    color: DesignSystem.colors.neutral[0],
  },
  assistantText: {
    color: DesignSystem.colors.neutral[900],
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[2],
    paddingVertical: DesignSystem.spacing[2],
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[400],
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.4,
  },
  suggestionsContainer: {
    marginTop: DesignSystem.spacing[6],
    gap: DesignSystem.spacing[3],
  },
  suggestionsLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[2],
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.primary[200],
    padding: DesignSystem.spacing[4],
    ...DesignSystem.shadows.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[700],
  },
  suggestionArrow: {
    fontSize: 16,
    color: DesignSystem.colors.primary[500],
    marginLeft: DesignSystem.spacing[2],
  },
  inputContainer: {
    padding: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[200],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: DesignSystem.radius.xl,
    paddingLeft: DesignSystem.spacing[4],
    paddingRight: DesignSystem.spacing[2],
    paddingVertical: DesignSystem.spacing[2],
  },
  input: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[900],
    maxHeight: 100,
    paddingVertical: DesignSystem.spacing[2],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: DesignSystem.colors.neutral[300],
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: DesignSystem.colors.neutral[0],
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
});
