import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { calculateReadyScore, getReadyColor, getReadyEmoji, getReadyMessage } from '@/lib/ready';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';

interface ReadyCardProps {
  tests: HormoneTest[];
  userGender: 'male' | 'female' | 'other';
}

export function ReadyCard({ tests, userGender }: ReadyCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const readyData = calculateReadyScore(tests, userGender);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `My READY score today: ${readyData.score}/100 ${getReadyEmoji(readyData.score)}\n\n${getReadyMessage(readyData.score)}\n\nTracking with HormoIQ`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewBreakdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBreakdown(true);
  };

  // Locked state
  if (!readyData.can_calculate) {
    return (
      <View style={styles.card}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>READY Score Locked</Text>
          <Text style={styles.lockedSubtitle}>
            {readyData.tests_needed} more test{readyData.tests_needed !== 1 ? 's' : ''} needed in last 7 days
          </Text>
          <Text style={styles.lockedHint}>
            Log at least 3 tests this week to unlock your daily READY score
          </Text>
        </View>
      </View>
    );
  }

  const color = getReadyColor(readyData.score);
  const emoji = getReadyEmoji(readyData.score);
  const message = getReadyMessage(readyData.score);

  return (
    <>
      <TouchableOpacity 
        style={[styles.card, { borderColor: color }]} 
        onPress={handleViewBreakdown}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.label}>Your READY Score</Text>
          <View style={[styles.confidenceBadge, {
            backgroundColor: readyData.confidence === 'high' ? '#10B981' : 
                            readyData.confidence === 'medium' ? '#F59E0B' : '#EF4444'
          }]}>
            <Text style={styles.confidenceText}>
              {readyData.confidence === 'high' ? 'High ✅' :
               readyData.confidence === 'medium' ? 'Med 🟡' : 'Low ⚠️'}
            </Text>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.ringContainer}>
          <ProgressRing
            score={readyData.score}
            color={color}
            size={200}
            strokeWidth={16}
          />
          <View style={styles.scoreOverlay}>
            <Text style={[styles.scoreNumber, { color }]}>{readyData.score}</Text>
            <Text style={styles.scoreEmoji}>{emoji}</Text>
          </View>
        </View>

        <Text style={styles.message}>{message}</Text>
        <Text style={styles.levelLabel}>
          {readyData.level === 'exceptional' ? 'EXCEPTIONAL' :
           readyData.level === 'good' ? 'GOOD' :
           readyData.level === 'moderate' ? 'MODERATE' :
           readyData.level === 'low' ? 'LOW' : 'VERY LOW'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Text style={styles.actionButtonText}>Share 📤</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewBreakdown}
          >
            <Text style={styles.actionButtonText}>Details →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Breakdown Modal */}
      <Modal
        visible={showBreakdown}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBreakdown(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>READY Breakdown</Text>
            <TouchableOpacity 
              onPress={() => setShowBreakdown(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Summary */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Today's Score</Text>
              <View style={[styles.summaryCard, { borderLeftColor: color }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryScore, { color }]}>
                    {readyData.score}/100
                  </Text>
                  <Text style={styles.summaryEmoji}>{emoji}</Text>
                </View>
                <Text style={styles.summaryMessage}>{message}</Text>
              </View>
            </View>

            {/* Contributing Factors */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Contributing Factors</Text>
              {[
                { 
                  label: 'Cortisol 💧', 
                  data: readyData.factors.cortisol,
                  weight: '30%'
                },
                { 
                  label: 'Testosterone ⚡', 
                  data: readyData.factors.testosterone,
                  weight: '25%'
                },
                { 
                  label: 'DHEA 🔥', 
                  data: readyData.factors.dhea,
                  weight: '15%'
                },
                { 
                  label: 'Trend 📈', 
                  data: readyData.factors.trend,
                  weight: '15%'
                },
                { 
                  label: 'Consistency 🎯', 
                  data: readyData.factors.consistency,
                  weight: '15%'
                },
              ].map((item, index) => (
                <View key={index} style={styles.factorItem}>
                  <View style={styles.factorHeader}>
                    <Text style={styles.factorLabel}>{item.label}</Text>
                    <Text style={styles.factorWeight}>{item.weight}</Text>
                  </View>
                  <View style={styles.factorBar}>
                    <View 
                      style={[
                        styles.factorBarFill,
                        { 
                          width: `${item.data.score}%`,
                          backgroundColor: getReadyColor(item.data.score)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.factorScore}>{item.data.score}/100</Text>
                  {'status' in item.data && (
                    <Text style={styles.factorStatus}>
                      Status: {item.data.status}
                      {item.data.hours_ago !== undefined && ` (${item.data.hours_ago}h ago)`}
                    </Text>
                  )}
                  {'direction' in item.data && (
                    <Text style={styles.factorStatus}>
                      Direction: {item.data.direction}
                    </Text>
                  )}
                  {'tests_this_week' in item.data && (
                    <Text style={styles.factorStatus}>
                      Tests this week: {item.data.tests_this_week}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Protocol */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Today's Protocol</Text>
              {readyData.protocol.map((item, index) => (
                <View key={index} style={styles.protocolItem}>
                  <Text style={styles.protocolText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Progress Ring Component
 */
function ProgressRing({ 
  score, 
  color, 
  size = 200, 
  strokeWidth = 16 
}: { 
  score: number; 
  color: string; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: DesignSystem.spacing[8],  // 32px
    borderRadius: DesignSystem.radius['2xl'],  // 24px
    backgroundColor: DesignSystem.colors.neutral[0],
    marginBottom: DesignSystem.spacing[6],
    ...DesignSystem.shadows.lg,
    // No border for cleaner look
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[5],
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[4],
  },
  lockedTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    marginBottom: DesignSystem.spacing[2],
    color: DesignSystem.colors.neutral[900],
  },
  lockedSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  lockedHint: {
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreEmoji: {
    fontSize: 32,
    marginTop: 4,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  levelLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  summaryEmoji: {
    fontSize: 40,
  },
  summaryMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  factorItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  factorWeight: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  factorBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  factorScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  factorStatus: {
    fontSize: 12,
    color: '#666',
  },
  protocolItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  protocolText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 22,
  },
});

