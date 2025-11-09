import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

// This would ideally fetch from a CMS or database
const ARTICLE_CONTENT: Record<string, { title: string; content: string; icon: string }> = {
  'welcome': {
    title: 'Welcome to HormoIQ',
    icon: '👋',
    content: `# Getting Started with HormoIQ

Welcome to your hormone tracking journey! HormoIQ helps you understand and optimize your hormonal health through regular testing and data-driven insights.

## What You'll Track

HormoIQ supports tracking three key hormones:
• **Cortisol** (💧): The stress hormone
• **Testosterone** (⚡): Energy and vitality
• **DHEA** (🔥): Anti-aging and wellness

## Your Journey

1. **Log Tests**: Use your saliva test strips
2. **Add Context**: Sleep, stress, exercise
3. **Unlock Features**: More tests = more insights
4. **Optimize**: Track what works for you

## Privacy First

Your health data is private and secure. We never share your information without explicit permission.`,
  },
  'first-test': {
    title: 'Logging Your First Test',
    icon: '🧪',
    content: `# How to Log Your First Test

## Step 1: Prepare Your Test Strip

Wait 30 minutes after eating or drinking before testing. This ensures accurate results.

## Step 2: Collect Saliva

Allow saliva to pool in your mouth for 2-3 minutes without swallowing. Apply to the test strip according to your kit instructions.

## Step 3: Wait for Results

Most tests take 5-10 minutes to process. Read the results according to your kit's reference chart.

## Step 4: Log in App

1. Tap the TEST™ button
2. Select your hormone type
3. Enter the numeric value
4. Add context (optional but recommended)
5. Save your test

## Tips for Success

✓ Test at the same time each day
✓ Keep your test strips in a cool, dry place
✓ Take a photo for your records
✓ Be consistent with your testing schedule`,
  },
  'readyscore': {
    title: 'READYSCORE™ Explained',
    icon: '⚡',
    content: `# Understanding READYSCORE™

READYSCORE™ is your daily wellness metric, calculated from your recent hormone tests and lifestyle factors.

## What It Measures

Your READYSCORE (0-100) indicates how ready you are for:
• Physical activity and exertion
• Mental performance and focus
• Recovery and restoration

## How It's Calculated

We analyze:
• Recent hormone levels (last 7 days)
• Trends and patterns
• Context factors (sleep, stress, exercise)
• Historical comparisons

## Score Ranges

• **90-100**: Peak readiness 🔥
• **70-89**: Good condition ✅
• **50-69**: Moderate readiness ⚠️
• **Below 50**: Focus on recovery 💤

## Unlocking READYSCORE

Log at least 3 tests in the past 7 days to unlock your READYSCORE.

## Using Your Score

Use READYSCORE to:
• Plan intense workouts
• Schedule important meetings
• Prioritize rest days
• Optimize your daily routine`,
  },
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = id ? ARTICLE_CONTENT[id] : null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!article) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article Not Found</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>Article not found</Text>
          <Text style={styles.emptyDescription}>
            This article doesn't exist or has been moved
          </Text>
        </View>
      </View>
    );
  }

  // Simple markdown-like rendering
  const renderContent = () => {
    const lines = article.content.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={index} style={styles.h1}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={index} style={styles.h2}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('• ')) {
        elements.push(
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{line.replace('• ', '')}</Text>
          </View>
        );
      } else if (line.startsWith('✓ ')) {
        elements.push(
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.listText}>{line.replace('✓ ', '')}</Text>
          </View>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={index} style={styles.spacer} />);
      } else {
        // Regular paragraph
        const processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '$1'); // Bold (simplified)
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {processedLine}
          </Text>
        );
      }
    });

    return elements;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {article.title}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.articleIcon}>{article.icon}</Text>
        </View>

        {renderContent()}

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
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    textAlign: 'center',
    marginHorizontal: DesignSystem.spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  articleIcon: {
    fontSize: DesignSystem.iconSize['3xl'] * 1.5,
  },
  h1: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
    marginTop: DesignSystem.spacing[2],
  },
  h2: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[3],
    marginTop: DesignSystem.spacing[6],
  },
  paragraph: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.base * 1.8,
    marginBottom: DesignSystem.spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing[2],
    paddingLeft: DesignSystem.spacing[4],
  },
  bullet: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[500],
    marginRight: DesignSystem.spacing[3],
    minWidth: 20,
  },
  listText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
  },
  spacer: {
    height: DesignSystem.spacing[4],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing[8],
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
});

