import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  style?: ViewStyle;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  maxWidth = SCREEN_WIDTH - 60,
  style,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const showTooltip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={showTooltip}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {children}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={hideTooltip}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.tooltipContainer, { maxWidth }]}>
                <View
                  style={[
                    styles.tooltip,
                    position === 'top' && styles.tooltipTop,
                    position === 'bottom' && styles.tooltipBottom,
                  ]}
                >
                  <Text style={styles.tooltipText}>{content}</Text>
                  
                  {/* Arrow */}
                  <View
                    style={[
                      styles.arrow,
                      position === 'top' && styles.arrowBottom,
                      position === 'bottom' && styles.arrowTop,
                    ]}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={hideTooltip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Got it</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Info icon with tooltip
interface InfoTooltipProps {
  content: string;
  size?: number;
  color?: string;
}

export function InfoTooltip({
  content,
  size = 20,
  color = DesignSystem.colors.neutral[500],
}: InfoTooltipProps) {
  return (
    <Tooltip content={content}>
      <View style={[styles.infoIcon, { width: size, height: size }]}>
        <Text style={[styles.infoIconText, { color, fontSize: size * 0.8 }]}>ⓘ</Text>
      </View>
    </Tooltip>
  );
}

// Help icon with tooltip (alternative style)
export function HelpTooltip({
  content,
  size = 20,
}: {
  content: string;
  size?: number;
}) {
  return (
    <Tooltip content={content}>
      <View
        style={[
          styles.helpIcon,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={[styles.helpIconText, { fontSize: size * 0.6 }]}>?</Text>
      </View>
    </Tooltip>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing[6],
  },
  tooltipContainer: {
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: DesignSystem.colors.neutral[900],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    ...DesignSystem.shadows.lg,
    position: 'relative',
  },
  tooltipTop: {
    marginBottom: DesignSystem.spacing[2],
  },
  tooltipBottom: {
    marginTop: DesignSystem.spacing[2],
  },
  tooltipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.regular,
    color: DesignSystem.colors.neutral[0],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -8,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: DesignSystem.colors.neutral[900],
  },
  arrowBottom: {
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: DesignSystem.colors.neutral[900],
  },
  closeButton: {
    marginTop: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.full,
    minHeight: DesignSystem.touchTarget.minimum,
    justifyContent: 'center',
    ...DesignSystem.shadows.md,
  },
  closeButtonText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  infoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  helpIcon: {
    backgroundColor: DesignSystem.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconText: {
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.primary[600],
  },
});

