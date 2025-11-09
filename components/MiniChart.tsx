import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface DataPoint {
  value: number;
  timestamp: Date;
}

interface MiniChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  strokeWidth?: number;
  type?: 'line' | 'area';
}

/**
 * Mini chart component for displaying trends in cards
 * Optimized for small spaces with clean, minimal design
 */
export function MiniChart({
  data,
  width = screenWidth - DesignSystem.spacing[6] * 2 - DesignSystem.spacing[12],
  height = 60,
  color = DesignSystem.colors.primary[500],
  showDots = false,
  strokeWidth = 2,
  type = 'line',
}: MiniChartProps) {
  if (data.length < 2) {
    return <View style={[styles.container, { width, height }]} />;
  }

  // Calculate min/max for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // Create points for the path
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const normalizedValue = (point.value - minValue) / valueRange;
    const y = height - normalizedValue * height;
    return { x, y, value: point.value };
  });

  // Create SVG path
  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    
    // Use smooth curves for better visual
    const prevPoint = points[index - 1];
    const cpX = (prevPoint.x + point.x) / 2;
    return `${path} Q ${cpX} ${prevPoint.y}, ${point.x} ${point.y}`;
  }, '');

  // Create area path (for filled chart)
  const areaPath = type === 'area'
    ? `${linePath} L ${width} ${height} L 0 ${height} Z`
    : null;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Grid lines (subtle) */}
        <Line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={DesignSystem.colors.neutral[200]}
          strokeWidth={1}
          opacity={0.5}
        />

        {/* Area fill */}
        {areaPath && (
          <Path
            d={areaPath}
            fill={color}
            opacity={0.1}
          />
        )}

        {/* Line */}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots at data points */}
        {showDots && points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={color}
            stroke={DesignSystem.colors.neutral[0]}
            strokeWidth={1.5}
          />
        ))}

        {/* Highlight last point */}
        {points.length > 0 && (
          <Circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill={color}
            stroke={DesignSystem.colors.neutral[0]}
            strokeWidth={2}
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});

