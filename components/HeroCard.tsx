import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

interface HeroCardProps {
  insight: string;
  recommendations: string[];
  primaryAction: {
    label: string;
    route: string;
  };
}

export default function HeroCard({ insight, recommendations, primaryAction }: HeroCardProps) {
  const handleAction = () => {
    // Medium haptic for important action (100/100 UX)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(primaryAction.route as any);
  };

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>🎯 TODAY'S FOCUS</Text>
      
      <Text style={styles.heroInsight}>{insight}</Text>
      
      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsLabel}>💡 Perfect time to:</Text>
          {recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationItem}>
              • {rec}
            </Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleAction}
        activeOpacity={0.7}
      >
        <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: DesignSystem.colors.primary[500], // Primary purple
    borderRadius: 20,
    padding: 24, // 100/100 UX: 24px padding vs 18px for other cards
    marginBottom: 24,
    // Enhanced shadow for prominence (100/100 UX)
    shadowColor: DesignSystem.colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroInsight: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 4,
    marginBottom: 4,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.primary[500],
  },
});

