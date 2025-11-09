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
import { sanitizeAIResponse, sanitizeChatMessage } from '@/lib/sanitize';
import { AuroraBackground } from '@/components/AuroraBackground';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isStreaming?: boolean; // For streaming animation
}

// Helper function to parse markdown bold text
function parseMarkdownText(text: string): Array<{ text: string; bold: boolean }> {
  const parts: Array<{ text: string; bold: boolean }> = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), bold: false });
    }
    // Add the bold text
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), bold: false });
  }

  return parts.length > 0 ? parts : [{ text, bold: false }];
}

export default function AskScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingPhase, setLoadingPhase] = useState<'searching' | 'reading' | 'thinking' | null>(null); // Perplexity-style loading
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

      const questions = await getStarterQuestions({ testsCount: count || 0 });
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Error loading starter questions:', error);
      const fallbackQuestions = await getStarterQuestions();
      setSuggestedQuestions(fallbackQuestions);
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

      // Fetch schedule data (NEW)
      const { data: scheduleEvents } = await supabase
        .from('test_schedule_events')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      // Fetch user schedule settings
      const { data: userSchedule } = await supabase
        .from('users')
        .select('test_schedule_pattern, tests_remaining, kit_received_date')
        .eq('id', user.id)
        .single();

      // Calculate schedule statistics
      const scheduleData = scheduleEvents && scheduleEvents.length > 0 ? {
        testsCompleted: scheduleEvents.filter(e => e.completed).length,
        testsRemaining: userSchedule?.tests_remaining || 12,
        schedulePattern: userSchedule?.test_schedule_pattern || 'Not set',
        nextTestDate: scheduleEvents.find(e => !e.completed && !e.skipped)?.scheduled_date,
        adherenceRate: Math.round((scheduleEvents.filter(e => e.completed).length / Math.max(1, scheduleEvents.filter(e => new Date(e.scheduled_date) < new Date()).length)) * 100),
        missedTests: scheduleEvents.filter(e => !e.completed && !e.skipped && new Date(e.scheduled_date) < new Date()).length,
      } : undefined;

      return {
        userProfile: profile || undefined,
        recentTests: tests || [],
        readyScore: readyScores?.[0]?.score,
        readyScoreDetails: readyScores?.[0],
        bioAge: bioAges?.[0]?.biological_age,
        bioAgeDetails: bioAges?.[0],
        impactAnalyses: impacts || [],
        activeProtocols: protocols || [],
        scheduleData, // NEW
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {};
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const rawText = messageText || inputText.trim();
    if (!rawText || !user) return;

    // Sanitize and validate user input
    const textToSend = sanitizeChatMessage(rawText);
    if (!textToSend) {
      Alert.alert('Invalid Input', 'Please enter a valid message (max 500 characters).');
      return;
    }

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

    // Perplexity-style loading phases
    setLoadingPhase('searching');
    setTimeout(() => setLoadingPhase('reading'), 800);
    setTimeout(() => setLoadingPhase('thinking'), 1600);

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

      // Sanitize AI response to prevent XSS
      const sanitizedReply = sanitizeAIResponse(response.reply);
      
      // Add assistant message with streaming animation
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: sanitizedReply,
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLoadingPhase(null);

      // Simulate streaming by progressively revealing text with auto-scroll
      const words = sanitizedReply.split(' ');
      let currentText = '';
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: currentText }
              : msg
          )
        );
        
        // Auto-scroll to bottom as text generates (every 5 words for smoothness)
        if (i % 5 === 0) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
        
        await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms per word
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

      // Final scroll to ensure everything is visible
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

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
      setLoadingPhase(null);
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
      <AuroraBackground showRadialGradient={true}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your coach...</Text>
        </View>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground showRadialGradient={true}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      {/* Header - Perplexity Style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>ASK</Text>
            <Text style={styles.headerSubtitle}>Powered by GPT-4</Text>
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
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>Your AI Hormone Coach</Text>
            <Text style={styles.emptyText}>
              Get personalized insights based on your test results, patterns, and data. Ask anything about hormone optimization.
            </Text>
            
            {/* What I Know Section - Perplexity Style */}
            <View style={styles.dataAccessCard}>
              <Text style={styles.dataAccessTitle}>What I have access to:</Text>
              <View style={styles.dataAccessList}>
                <Text style={styles.dataAccessItem}>✓ Your hormone test results</Text>
                <Text style={styles.dataAccessItem}>✓ ReadyScore & BioAge calculations</Text>
                <Text style={styles.dataAccessItem}>✓ Impact analyses & patterns</Text>
                <Text style={styles.dataAccessItem}>✓ Active protocols & progress</Text>
              </View>
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Wellness optimization only • Not medical advice
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
            {message.role === 'assistant' && (
              <View style={styles.assistantIconSmall}>
                <Text style={styles.assistantIconText}>✦</Text>
              </View>
            )}
            {message.role === 'assistant' ? (
              // Format assistant messages with proper paragraph spacing and markdown bold
              message.content.split('\n\n').map((paragraph, pIndex) => {
                const parsedParts = parseMarkdownText(paragraph.trim());
                return (
                  <Text
                    key={`${message.id}-p${pIndex}`}
                    style={[styles.messageText, styles.assistantText, pIndex > 0 && styles.paragraphSpacing]}
                  >
                    {parsedParts.map((part, partIndex) => (
                      <Text
                        key={`${message.id}-p${pIndex}-part${partIndex}`}
                        style={part.bold ? styles.boldText : undefined}
                      >
                        {part.text}
                      </Text>
                    ))}
                  </Text>
                );
              })
            ) : (
              <Text style={[styles.messageText, styles.userText]}>
                {message.content}
              </Text>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <View style={styles.assistantIconSmall}>
              <Text style={styles.assistantIconText}>✦</Text>
            </View>
            <View style={styles.loadingContainer}>
              {loadingPhase === 'searching' && (
                <Text style={styles.loadingPhaseText}>Searching your data...</Text>
              )}
              {loadingPhase === 'reading' && (
                <Text style={styles.loadingPhaseText}>Reading patterns...</Text>
              )}
              {loadingPhase === 'thinking' && (
                <Text style={styles.loadingPhaseText}>Generating insights...</Text>
              )}
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotDelay1]} />
                <View style={[styles.typingDot, styles.typingDotDelay2]} />
              </View>
            </View>
          </View>
        )}

        {/* Suggested Questions - Perplexity Style */}
        {suggestedQuestions.length > 0 && !loading && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Related</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionPill}
                onPress={() => handleSuggestedQuestion(question)}
                activeOpacity={0.6}
              >
                <Text style={styles.suggestionIcon}>→</Text>
                <Text style={styles.suggestionText}>{question}</Text>
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
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DesignSystem.spacing[4],
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[700],
    fontWeight: '300',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[3],
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconText: {
    fontSize: 16,
    color: DesignSystem.colors.neutral[0],
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[500],
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[16],
    paddingHorizontal: DesignSystem.spacing[8],
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  emptyIcon: {
    fontSize: 36,
    color: DesignSystem.colors.primary[500],
  },
  emptyTitle: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
    letterSpacing: -1,
  },
  emptyText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    marginBottom: DesignSystem.spacing[6],
    maxWidth: 340,
  },
  dataAccessCard: {
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
    marginBottom: DesignSystem.spacing[6],
    width: '100%',
    maxWidth: 340,
  },
  dataAccessTitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
    marginBottom: DesignSystem.spacing[3],
    letterSpacing: -0.2,
  },
  dataAccessList: {
    gap: DesignSystem.spacing[2],
  },
  dataAccessItem: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    letterSpacing: -0.2,
    lineHeight: DesignSystem.typography.fontSize.sm * 1.5,
  },
  disclaimer: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.lg,
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[200],
  },
  disclaimerText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[700],
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  messageBubble: {
    marginBottom: DesignSystem.spacing[6],
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.radius['2xl'],
    borderBottomRightRadius: DesignSystem.radius.md,
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[5],
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: DesignSystem.radius['2xl'],
    borderBottomLeftRadius: DesignSystem.radius.md,
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  assistantIconSmall: {
    width: 20,
    height: 20,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[2],
  },
  assistantIconText: {
    fontSize: 10,
    color: DesignSystem.colors.neutral[0],
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    letterSpacing: -0.2,
  },
  userText: {
    color: DesignSystem.colors.neutral[0],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  assistantText: {
    color: DesignSystem.colors.neutral[900],
  },
  boldText: {
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  paragraphSpacing: {
    marginTop: DesignSystem.spacing[4],
  },
  loadingContainer: {
    gap: DesignSystem.spacing[2],
  },
  loadingPhaseText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[600],
    letterSpacing: -0.2,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[2],
    paddingVertical: DesignSystem.spacing[1],
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[400],
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
  suggestionsTitle: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: DesignSystem.spacing[2],
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.neutral[200],
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[5],
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionIcon: {
    fontSize: 16,
    color: DesignSystem.colors.primary[500],
    marginRight: DesignSystem.spacing[3],
    fontWeight: 'bold',
  },
  suggestionText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[800],
    letterSpacing: -0.3,
    lineHeight: DesignSystem.typography.fontSize.sm * 1.4,
  },
  inputContainer: {
    padding: DesignSystem.spacing[5],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: DesignSystem.colors.neutral[50],
    borderRadius: DesignSystem.radius['2xl'],
    paddingLeft: DesignSystem.spacing[5],
    paddingRight: DesignSystem.spacing[2],
    paddingVertical: DesignSystem.spacing[3],
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.neutral[200],
  },
  input: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[900],
    maxHeight: 100,
    paddingVertical: DesignSystem.spacing[2],
    letterSpacing: -0.2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: DesignSystem.colors.neutral[300],
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 18,
    color: DesignSystem.colors.neutral[0],
    fontWeight: 'bold',
  },
});
