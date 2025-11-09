import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DesignSystem } from '@/constants/DesignSystem';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';

type TimeRange = '7D' | '30D' | '90D' | 'All';

interface InteractiveHormoneChartProps {
  tests: HormoneTest[];
  selectedHormone?: 'cortisol' | 'testosterone' | 'dhea' | 'progesterone';
}

export function InteractiveHormoneChart({
  tests,
  selectedHormone = 'cortisol',
}: InteractiveHormoneChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [filteredData, setFilteredData] = useState<HormoneTest[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - DesignSystem.spacing[12];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    filterDataByTimeRange();
  }, [tests, timeRange, selectedHormone]);

  const filterDataByTimeRange = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '7D':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30D':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90D':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'All':
        cutoffDate = new Date(0); // Beginning of time
        break;
    }

    const filtered = tests
      .filter(
        (test) =>
          test.hormone_type === selectedHormone &&
          new Date(test.timestamp) >= cutoffDate
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    setFilteredData(filtered);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRange(range);
  };

  const getChartData = () => {
    if (filteredData.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [0] }],
      };
    }

    // Limit to max 10 points for readability
    const maxPoints = 10;
    const step = Math.max(1, Math.floor(filteredData.length / maxPoints));
    const sampledData = filteredData.filter((_, index) => index % step === 0);

    const labels = sampledData.map((test) => {
      const date = new Date(test.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const values = sampledData.map((test) => test.value);

    return {
      labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => getHormoneColor(opacity),
          strokeWidth: 3,
        },
      ],
    };
  };

  const getHormoneColor = (opacity = 1) => {
    const colors = {
      cortisol: DesignSystem.colors.charts.cortisol,
      testosterone: DesignSystem.colors.charts.testosterone,
      dhea: DesignSystem.colors.charts.dhea,
      progesterone: DesignSystem.colors.charts.progesterone,
    };
    const color = colors[selectedHormone];
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getHormoneName = () => {
    const names = {
      cortisol: 'Cortisol',
      testosterone: 'Testosterone',
      dhea: 'DHEA',
      progesterone: 'Progesterone',
    };
    return names[selectedHormone];
  };

  const getAverageValue = () => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, test) => acc + test.value, 0);
    return (sum / filteredData.length).toFixed(2);
  };

  const getTrendDirection = () => {
    if (filteredData.length < 2) return 'neutral';
    const firstValue = filteredData[0].value;
    const lastValue = filteredData[filteredData.length - 1].value;
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    if (percentChange > 5) return 'up';
    if (percentChange < -5) return 'down';
    return 'neutral';
  };

  const chartData = getChartData();
  const average = getAverageValue();
  const trend = getTrendDirection();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{getHormoneName()} Trend</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{average}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <Text style={styles.statValue}>
              {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
            </Text>
          </View>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeRangeContainer}
      >
        {(['7D', '30D', '90D', 'All'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => handleTimeRangeChange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No data for this time range</Text>
            <Text style={styles.emptySubtext}>
              Log more tests to see your trends
            </Text>
          </View>
        ) : (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: DesignSystem.colors.surface,
              backgroundGradientFrom: DesignSystem.colors.surface,
              backgroundGradientTo: DesignSystem.colors.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => getHormoneColor(opacity),
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: DesignSystem.radius.lg,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: getHormoneColor(1),
                fill: DesignSystem.colors.surface,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: DesignSystem.colors.neutral[200],
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withShadow={false}
            withDots={true}
          />
        )}
      </View>

      {/* Data Points Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredData.length} data {filteredData.length === 1 ? 'point' : 'points'} in{' '}
          {timeRange}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  header: {
    marginBottom: DesignSystem.spacing[5],
  },
  title: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[6],
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing[1],
  },
  statValue: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.text.primary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[2],
    marginBottom: DesignSystem.spacing[5],
    paddingHorizontal: DesignSystem.spacing[1],
  },
  timeRangeButton: {
    paddingVertical: DesignSystem.spacing[2],
    paddingHorizontal: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeRangeButtonActive: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[600],
  },
  timeRangeText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.secondary,
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  chart: {
    borderRadius: DesignSystem.radius.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing[12],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[3],
  },
  emptyText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[1],
  },
  emptySubtext: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
  },
  summary: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.tertiary,
  },
});

