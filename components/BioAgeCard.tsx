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
import { calculateBioAge, getBioAgeColor, getBioAgeMessage } from '@/lib/bioage';
import { HormoneTest } from '@/types';
import * as Haptics from 'expo-haptics';

interface BioAgeCardProps {
  tests: HormoneTest[];
  chronologicalAge: number;
  userGender: 'male' | 'female' | 'other';
}

export function BioAgeCard({ tests, chronologicalAge, userGender }: BioAgeCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const bioAgeData = calculateBioAge(tests, chronologicalAge, userGender);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await Share.share({
        message: `My BioAge: ${bioAgeData.biological_age} years old! (I'm actually ${bioAgeData.chronological_age}, so I'm ${Math.abs(bioAgeData.delta)} years ${bioAgeData.delta > 0 ? 'younger' : 'older'} biologically) 🎯\n\nTracking with HormoIQ`,
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
  if (!bioAgeData.can_calculate) {
    return (
      <View style={styles.card}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockedTitle}>BioAge Locked</Text>
          <Text style={styles.lockedSubtitle}>
            {bioAgeData.tests_needed} more test{bioAgeData.tests_needed !== 1 ? 's' : ''} needed over 2+ weeks
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(tests.length / 10) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {tests.length} / 10 tests
          </Text>
        </View>
      </View>
    );
  }

  const deltaColor = getBioAgeColor(bioAgeData.delta);
  const message = getBioAgeMessage(bioAgeData.delta);

  return (
    <>
      <TouchableOpacity 
        style={[styles.card, { borderColor: deltaColor }]} 
        onPress={handleViewBreakdown}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.label}>Your BioAge</Text>
          <View style={[styles.confidenceBadge, {
            backgroundColor: bioAgeData.confidence === 'high' ? '#10B981' : 
                            bioAgeData.confidence === 'medium' ? '#F59E0B' : '#EF4444'
          }]}>
            <Text style={styles.confidenceText}>
              {bioAgeData.confidence === 'high' ? 'High ✅' :
               bioAgeData.confidence === 'medium' ? 'Med 🟡' : 'Low ⚠️'}
            </Text>
          </View>
        </View>

        <View style={styles.ageDisplay}>
          <Text style={[styles.bioAge, { color: deltaColor }]}>
            {bioAgeData.biological_age}
          </Text>
          <Text style={styles.yearsLabel}>years old</Text>
        </View>

        <View style={styles.comparison}>
          <Text style={styles.comparisonText}>
            Chronological age: {bioAgeData.chronological_age}
          </Text>
          <Text style={[styles.delta, { color: deltaColor }]}>
            {bioAgeData.delta > 0 && '+'}
            {bioAgeData.delta} years {bioAgeData.delta >= 0 ? 'younger' : 'older'} {message}
          </Text>
        </View>

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
            <Text style={styles.modalTitle}>BioAge Breakdown</Text>
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
              <Text style={styles.modalSectionTitle}>Summary</Text>
              <View style={styles.summaryCard}>
                <Text style={[styles.modalBioAge, { color: deltaColor }]}>
                  {bioAgeData.biological_age}
                </Text>
                <Text style={styles.modalCompare}>
                  vs {bioAgeData.chronological_age} actual
                </Text>
                <Text style={[styles.modalDelta, { color: deltaColor }]}>
                  {bioAgeData.delta > 0 ? '+' : ''}{bioAgeData.delta} years
                </Text>
                <Text style={styles.modalMessage}>{message}</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>What Contributes</Text>
              {[
                { label: 'Cortisol 💧', value: bioAgeData.breakdown.cortisol_years },
                { label: 'Testosterone ⚡', value: bioAgeData.breakdown.testosterone_years },
                { label: 'DHEA 🔥', value: bioAgeData.breakdown.dhea_years },
                { label: 'Cortisol/DHEA Ratio ⚖️', value: bioAgeData.breakdown.ratio_years },
                { label: 'Behavior Bonus 🎯', value: bioAgeData.breakdown.behavior_bonus },
              ].map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={[
                    styles.breakdownValue,
                    { color: item.value < 0 ? '#10B981' : item.value > 0 ? '#EF4444' : '#666' }
                  ]}>
                    {item.value > 0 ? '+' : ''}{item.value} {item.value === 1 || item.value === -1 ? 'year' : 'years'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Explanation */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How It Works</Text>
              <Text style={styles.explanationText}>
                Your BioAge is calculated based on how consistently your hormones stay in optimal ranges:
              </Text>
              <Text style={styles.bulletPoint}>
                • 80%+ tests optimal: Ages you backwards
              </Text>
              <Text style={styles.bulletPoint}>
                • 40-80% tests optimal: Neutral
              </Text>
              <Text style={styles.bulletPoint}>
                • &lt;40% tests optimal: Ages you forwards
              </Text>
              <Text style={styles.bulletPoint}>
                • Improving trend: Bonus (-0.5 years)
              </Text>
              <Text style={styles.bulletPoint}>
                • Consistent testing: Bonus (-1 year)
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 3,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  ageDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bioAge: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  yearsLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  comparison: {
    alignItems: 'center',
    marginBottom: 20,
  },
  comparisonText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  delta: {
    fontSize: 18,
    fontWeight: '600',
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
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  modalBioAge: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalCompare: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalDelta: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    marginLeft: 8,
  },
});

