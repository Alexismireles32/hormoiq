import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Protocol } from '@/types';
import { getCategoryColor, getDifficultyColor } from '@/lib/protocol-library';
import * as Haptics from 'expo-haptics';

interface ProtocolCardProps {
  protocol: Protocol | Omit<Protocol, 'id' | 'created_at'>;
  onPress: () => void;
}

export function ProtocolCard({ protocol, onPress }: ProtocolCardProps) {
  const categoryColor = getCategoryColor(protocol.category);
  const difficultyColor = getDifficultyColor(protocol.difficulty);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: categoryColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{protocol.icon}</Text>
        <View style={styles.badges}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.badgeText}>
              {protocol.difficulty.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.badgeText}>
              {protocol.category.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{protocol.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {protocol.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Text style={styles.metaText}>⏱️ {protocol.duration_days} days</Text>
          <Text style={styles.metaText}>
            {protocol.target_hormones.map(h => 
              h === 'cortisol' ? '💧' : h === 'testosterone' ? '⚡' : '🔥'
            ).join(' ')}
          </Text>
        </View>
        <Text style={[styles.viewButton, { color: categoryColor }]}>
          View →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 40,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
  },
  viewButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});

