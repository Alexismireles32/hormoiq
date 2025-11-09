import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

const HORMONES = [
  {
    type: 'cortisol',
    name: 'Cortisol',
    icon: '💧',
    color: DesignSystem.colors.hormones.cortisol,
    description: 'Stress hormone',
    unit: 'ng/mL',
  },
  {
    type: 'testosterone',
    name: 'Testosterone',
    icon: '⚡',
    color: DesignSystem.colors.hormones.testosterone,
    description: 'Energy & vitality',
    unit: 'ng/dL',
  },
  {
    type: 'dhea',
    name: 'DHEA',
    icon: '🔥',
    color: DesignSystem.colors.hormones.dhea,
    description: 'Hormone precursor',
    unit: 'ng/dL',
  },
] as const;

export default function TestSelectionScreen() {
  const handleSelectHormone = (hormoneType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/test/input',
      params: { hormone: hormoneType },
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Log a Test</Text>
            <Text style={styles.subtitle}>
              Choose which hormone you're testing
            </Text>
          </View>
        </View>

        {/* Hormone Cards */}
        <View style={styles.hormonesContainer}>
          {HORMONES.map((hormone, index) => (
            <TouchableOpacity
              key={hormone.type}
              style={[
                styles.hormoneCard,
                { borderColor: hormone.color },
              ]}
              onPress={() => handleSelectHormone(hormone.type)}
              activeOpacity={0.7}
            >
              <View style={styles.hormoneIconContainer}>
                <Text style={styles.hormoneIcon}>{hormone.icon}</Text>
              </View>
              
              <View style={styles.hormoneInfo}>
                <Text style={styles.hormoneName}>{hormone.name}</Text>
                <Text style={styles.hormoneDescription}>
                  {hormone.description}
                </Text>
                <Text style={styles.hormoneUnit}>Units: {hormone.unit}</Text>
              </View>

              <View style={styles.hormoneArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoTitle}>How to Test</Text>
          <Text style={styles.infoText}>
            Use your saliva test strip and compare the color to the chart provided. 
            Then enter the corresponding value on the next screen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.oura.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
    paddingTop: 60, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[8],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing[4],
  },
  backIcon: {
    fontSize: 20,
    color: DesignSystem.colors.neutral[900],
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
  },
  hormonesContainer: {
    gap: DesignSystem.spacing[4],
  },
  hormoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    padding: DesignSystem.spacing[5],
    ...DesignSystem.shadows.sm,
  },
  hormoneIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.radius.xl,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing[4],
  },
  hormoneIcon: {
    fontSize: 28,
  },
  hormoneInfo: {
    flex: 1,
  },
  hormoneName: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  hormoneDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    marginBottom: DesignSystem.spacing[1],
  },
  hormoneUnit: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[500],
  },
  hormoneArrow: {
    marginLeft: DesignSystem.spacing[3],
  },
  arrowIcon: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[400],
  },
  infoCard: {
    marginTop: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[100],
    padding: DesignSystem.spacing[5],
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  infoTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  infoText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * 1.6,
  },
});

