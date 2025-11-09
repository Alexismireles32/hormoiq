import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

export default function ConsentScreen() {
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleContinue = () => {
    if (!agreedToPrivacy || !agreedToTerms) {
      return; // Button is disabled anyway
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(onboarding)');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome to HormoIQ</Text>
        <Text style={styles.subtitle}>
          Before we begin, please review and accept our policies
        </Text>

        {/* Privacy Policy Consent */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Policy</Text>
          <Text style={styles.cardText}>
            We collect and store your hormone test data, age, biological sex, and usage information. All data is encrypted and secured. You have the right to export or delete your data at any time.
          </Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(legal)/privacy');
            }}
          >
            <Text style={styles.linkText}>Read Full Privacy Policy →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAgreedToPrivacy(!agreedToPrivacy);
            }}
          >
            <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
              {agreedToPrivacy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms of Service Consent */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Terms of Service</Text>
          <Text style={styles.cardText}>
            HormoIQ is a wellness app, NOT a medical device. It does not diagnose or treat medical conditions. Always consult a healthcare provider for medical advice.
          </Text>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(legal)/terms');
            }}
          >
            <Text style={styles.linkText}>Read Full Terms of Service →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAgreedToTerms(!agreedToTerms);
            }}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the Terms of Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerIcon}>⚕️</Text>
          <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This app is for wellness optimization only. It is NOT FDA cleared and NOT intended for medical diagnosis or treatment. Consult a healthcare provider for medical concerns.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (!agreedToPrivacy || !agreedToTerms) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!agreedToPrivacy || !agreedToTerms}
        >
          <Text style={[styles.continueButtonText, (!agreedToPrivacy || !agreedToTerms) && styles.continueButtonTextDisabled]}>
            Continue to Setup
          </Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  content: {
    padding: DesignSystem.spacing[6],
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing[8],
    lineHeight: 24,
  },
  card: {
    backgroundColor: DesignSystem.colors.surface,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    marginBottom: DesignSystem.spacing[5],
    borderWidth: 1,
    borderColor: DesignSystem.colors.neutral[200],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing[3],
  },
  cardText: {
    fontSize: 14,
    fontWeight: '300',
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing[4],
  },
  linkButton: {
    marginBottom: DesignSystem.spacing[4],
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignSystem.colors.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[3],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[300],
    marginRight: DesignSystem.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: DesignSystem.colors.primary,
    borderColor: DesignSystem.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: DesignSystem.colors.errorBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[5],
    marginBottom: DesignSystem.spacing[6],
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.error.light,
    alignItems: 'center',
  },
  disclaimerIcon: {
    fontSize: 32,
    marginBottom: DesignSystem.spacing[2],
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.error.DEFAULT,
    marginBottom: DesignSystem.spacing[2],
  },
  disclaimerText: {
    fontSize: 13,
    fontWeight: '400',
    color: DesignSystem.colors.error.DEFAULT,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: DesignSystem.colors.neutral[200],
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: DesignSystem.colors.neutral[400],
  },
});

