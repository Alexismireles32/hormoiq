import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';
import { AnimatedTouchable } from '@/components/AnimatedTouchable';
import { AnimatedCard } from '@/components/AnimatedCard';

interface HelpArticle {
  id: string;
  category: 'getting-started' | 'features' | 'testing' | 'data' | 'account' | 'troubleshooting';
  title: string;
  description: string;
  icon: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    id: 'welcome',
    category: 'getting-started',
    title: 'Welcome to HormoIQ',
    description: 'Learn the basics of hormone tracking and how to get started',
    icon: '👋',
  },
  {
    id: 'first-test',
    category: 'getting-started',
    title: 'Logging Your First Test',
    description: 'Step-by-step guide to logging your first hormone test',
    icon: '🧪',
  },
  {
    id: 'understanding-results',
    category: 'getting-started',
    title: 'Understanding Your Results',
    description: 'How to read and interpret your hormone test results',
    icon: '📊',
  },

  // Features
  {
    id: 'readyscore',
    category: 'features',
    title: 'READYSCORE™ Explained',
    description: 'What is READYSCORE and how is it calculated',
    icon: '⚡',
  },
  {
    id: 'bioage',
    category: 'features',
    title: 'Understanding BIOAGE™',
    description: 'Learn about biological age vs chronological age',
    icon: '🧬',
  },
  {
    id: 'impact',
    category: 'features',
    title: 'IMPACT™ Analysis',
    description: 'Track the effectiveness of your wellness interventions',
    icon: '🎯',
  },
  {
    id: 'protocols',
    category: 'features',
    title: 'Optimization Protocols',
    description: 'Browse and track wellness protocols',
    icon: '📋',
  },
  {
    id: 'ask',
    category: 'features',
    title: 'ASK™ AI Coach',
    description: 'Get personalized insights from your AI hormone coach',
    icon: '🤖',
  },

  // Testing
  {
    id: 'test-strips',
    category: 'testing',
    title: 'Using Test Strips',
    description: 'How to properly use saliva hormone test strips',
    icon: '🔬',
  },
  {
    id: 'test-timing',
    category: 'testing',
    title: 'When to Test',
    description: 'Best practices for timing your hormone tests',
    icon: '⏰',
  },
  {
    id: 'test-context',
    category: 'testing',
    title: 'Adding Context',
    description: 'Why context matters for accurate tracking',
    icon: '📝',
  },

  // Data & Privacy
  {
    id: 'data-privacy',
    category: 'data',
    title: 'Your Data & Privacy',
    description: 'How we protect and use your health data',
    icon: '🔒',
  },
  {
    id: 'export-data',
    category: 'data',
    title: 'Exporting Your Data',
    description: 'How to download and export your test history',
    icon: '📥',
  },

  // Account
  {
    id: 'account-settings',
    category: 'account',
    title: 'Account Settings',
    description: 'Manage your profile and preferences',
    icon: '⚙️',
  },

  // Troubleshooting
  {
    id: 'troubleshooting',
    category: 'troubleshooting',
    title: 'Common Issues',
    description: 'Solutions to frequently encountered problems',
    icon: '🔧',
  },
  {
    id: 'contact',
    category: 'troubleshooting',
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: '💬',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '📚' },
  { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
  { id: 'features', name: 'Features', icon: '✨' },
  { id: 'testing', name: 'Testing', icon: '🧪' },
  { id: 'data', name: 'Data', icon: '📊' },
  { id: 'account', name: 'Account', icon: '👤' },
  { id: 'troubleshooting', name: 'Help', icon: '❓' },
];

export default function HelpCenterScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleArticlePress = (article: HelpArticle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to article detail (to be implemented)
    router.push({
      pathname: '/help/article',
      params: { id: article.id }
    });
  };

  const filteredArticles = HELP_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search help articles..."
          placeholderTextColor={DesignSystem.colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map((category) => (
          <AnimatedTouchable
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
            }}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </AnimatedTouchable>
        ))}
      </ScrollView>

      {/* Articles */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or browse different categories
            </Text>
          </View>
        ) : (
          filteredArticles.map((article, index) => (
            <AnimatedCard key={article.id} index={index} style={styles.articleCard}>
              <AnimatedTouchable
                style={styles.articleContent}
                onPress={() => handleArticlePress(article)}
                scaleValue={0.98}
              >
                <View style={styles.articleIcon}>
                  <Text style={styles.articleIconText}>{article.icon}</Text>
                </View>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleDescription}>{article.description}</Text>
                </View>
                <Text style={styles.articleArrow}>→</Text>
              </AnimatedTouchable>
            </AnimatedCard>
          ))
        )}

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.quickLinksTitle}>Quick Links</Text>
          
          <AnimatedTouchable
            style={styles.quickLinkButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.quickLinkIcon}>🎓</Text>
            <Text style={styles.quickLinkText}>Take the App Tour</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={styles.quickLinkButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.quickLinkIcon}>🧪</Text>
            <Text style={styles.quickLinkText}>View Test Strip Tutorial</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={styles.quickLinkButton}
            onPress={() => router.push('/(tabs)/ask')}
          >
            <Text style={styles.quickLinkIcon}>🤖</Text>
            <Text style={styles.quickLinkText}>Ask AI Coach</Text>
          </AnimatedTouchable>
        </View>

        <View style={{ height: DesignSystem.spacing[20] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.oura.cardBorder,
  },
  backButton: {
    width: DesignSystem.touchTarget.comfortable,
    height: DesignSystem.touchTarget.comfortable,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: DesignSystem.iconSize.lg,
    color: DesignSystem.colors.neutral[900],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    marginHorizontal: DesignSystem.spacing[6],
    marginTop: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[4],
    height: DesignSystem.touchTarget.large,
  },
  searchIcon: {
    fontSize: DesignSystem.iconSize.md,
    marginRight: DesignSystem.spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[900],
  },
  clearButton: {
    padding: DesignSystem.spacing[2],
  },
  clearIcon: {
    fontSize: DesignSystem.iconSize.sm,
    color: DesignSystem.colors.neutral[400],
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[4],
    gap: DesignSystem.spacing[2],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.full,
    paddingVertical: DesignSystem.spacing[2],
    paddingHorizontal: DesignSystem.spacing[4],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    marginRight: DesignSystem.spacing[2],
  },
  categoryButtonActive: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[500],
  },
  categoryIcon: {
    fontSize: DesignSystem.iconSize.sm,
    marginRight: DesignSystem.spacing[2],
  },
  categoryText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[700],
  },
  categoryTextActive: {
    color: DesignSystem.colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  articleCard: {
    marginBottom: DesignSystem.spacing[3],
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[4],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing[4],
  },
  articleIconText: {
    fontSize: DesignSystem.iconSize.lg,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  articleDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.5,
  },
  articleArrow: {
    fontSize: DesignSystem.iconSize.md,
    color: DesignSystem.colors.neutral[400],
    marginLeft: DesignSystem.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing[20],
  },
  emptyIcon: {
    fontSize: DesignSystem.iconSize['3xl'],
    marginBottom: DesignSystem.spacing[4],
  },
  emptyTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  emptyDescription: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
  },
  quickLinksSection: {
    marginTop: DesignSystem.spacing[8],
    paddingTop: DesignSystem.spacing[6],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.oura.divider,
  },
  quickLinksTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  quickLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    marginBottom: DesignSystem.spacing[3],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
  },
  quickLinkIcon: {
    fontSize: DesignSystem.iconSize.md,
    marginRight: DesignSystem.spacing[3],
  },
  quickLinkText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[700],
  },
});

