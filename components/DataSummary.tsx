import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

export interface SummaryItem {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

interface DataSummaryProps {
  items: SummaryItem[];
  columns?: 2 | 3 | 4;
  compact?: boolean;
}

/**
 * Data summary grid component
 * Displays key metrics in a clean, scannable format
 */
export function DataSummary({ items, columns = 3, compact = false }: DataSummaryProps) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'neutral':
        return '→';
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return DesignSystem.colors.success.DEFAULT;
      case 'down':
        return DesignSystem.colors.error.DEFAULT;
      case 'neutral':
        return DesignSystem.colors.neutral[500];
      default:
        return DesignSystem.colors.neutral[500];
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { gap: compact ? DesignSystem.spacing[3] : DesignSystem.spacing[4] }]}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.item,
              {
                width: `${100 / columns - 2}%`,
                padding: compact ? DesignSystem.spacing[3] : DesignSystem.spacing[4],
              },
            ]}
          >
            {item.icon && (
              <Text style={[styles.icon, compact && styles.iconCompact]}>{item.icon}</Text>
            )}
            
            <Text
              style={[
                styles.value,
                compact && styles.valueCompact,
                item.color && { color: item.color },
              ]}
            >
              {item.value}
            </Text>
            
            <Text style={[styles.label, compact && styles.labelCompact]}>
              {item.label}
            </Text>
            
            {item.subtitle && (
              <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
                {item.subtitle}
              </Text>
            )}

            {item.trend && (
              <View style={styles.trendContainer}>
                <Text style={[styles.trendIcon, { color: getTrendColor(item.trend) }]}>
                  {getTrendIcon(item.trend)}
                </Text>
                {item.trendValue && (
                  <Text style={[styles.trendValue, { color: getTrendColor(item.trend) }]}>
                    {item.trendValue}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[3],
    ...DesignSystem.shadows.sm,
  },
  icon: {
    fontSize: DesignSystem.iconSize.lg,
    marginBottom: DesignSystem.spacing[2],
  },
  iconCompact: {
    fontSize: DesignSystem.iconSize.md,
    marginBottom: DesignSystem.spacing[1],
  },
  value: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  valueCompact: {
    fontSize: DesignSystem.typography.fontSize.xl,
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: DesignSystem.typography.fontSize.xs,
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing[1],
    textAlign: 'center',
  },
  subtitleCompact: {
    fontSize: 10,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignSystem.spacing[2],
    gap: DesignSystem.spacing[1],
  },
  trendIcon: {
    fontSize: DesignSystem.iconSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  trendValue: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});

