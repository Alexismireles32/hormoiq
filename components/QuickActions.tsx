import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

export default function QuickActions() {
  const actions = [
    { icon: '📊', label: 'Log Test', route: '/test' },
    { icon: '🤖', label: 'Ask AI', route: '/ask' },
    { icon: '📚', label: 'Browse', route: '/protocols' },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={() => handlePress(action.route)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>{action.icon}</Text>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: DesignSystem.colors.neutral[700],
  },
});

