import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function TermsOfServiceScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: November 9, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using HormoIQ ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          HormoIQ is a wellness optimization app that helps you track hormone levels and receive personalized wellness guidance. The App provides:
          {'\n'}• Hormone test result tracking
          {'\n'}• ReadyScore™ daily wellness metric
          {'\n'}• BioAge™ hormonal age calculation  
          {'\n'}• Impact™ intervention analysis
          {'\n'}• ASK™ AI wellness coaching
          {'\n'}• Protocol library and tracking
        </Text>

        <Text style={styles.sectionTitle}>3. Medical Disclaimer</Text>
        <Text style={styles.important}>
          IMPORTANT: HormoIQ is NOT a medical device and is NOT intended for medical diagnosis, treatment, or disease prevention.
        </Text>
        <Text style={styles.paragraph}>
          • This App provides wellness optimization guidance only
          {'\n'}• It is NOT a substitute for professional medical advice
          {'\n'}• Always consult a healthcare provider for medical concerns
          {'\n'}• DO NOT make medical decisions based solely on this App
          {'\n'}• The App is not FDA cleared or approved
        </Text>

        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You agree to:
          {'\n'}• Provide accurate information
          {'\n'}• Keep your account credentials secure
          {'\n'}• Use the App only for lawful purposes
          {'\n'}• Not attempt to hack or reverse engineer the App
          {'\n'}• Not share harmful or inappropriate content
          {'\n'}• Comply with all applicable laws and regulations
        </Text>

        <Text style={styles.sectionTitle}>5. Account and Access</Text>
        <Text style={styles.paragraph}>
          • You are responsible for maintaining account confidentiality
          {'\n'}• You must be at least 13 years old to use the App
          {'\n'}• We reserve the right to terminate accounts that violate these terms
          {'\n'}• We may suspend the service for maintenance or updates
        </Text>

        <Text style={styles.sectionTitle}>6. Data Accuracy</Text>
        <Text style={styles.paragraph}>
          • You are responsible for the accuracy of data you enter
          {'\n'}• Calculations are based on the data you provide
          {'\n'}• Incorrect data will lead to inaccurate results
          {'\n'}• We are not liable for decisions based on inaccurate data
        </Text>

        <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          • All content, trademarks, and data on the App are our property
          {'\n'}• ReadyScore™, BioAge™, Impact™, and ASK™ are our trademarks
          {'\n'}• You may not copy, modify, or distribute our content
          {'\n'}• Your test data belongs to you
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          {'\n\n'}• We provide the App "AS IS" without warranties
          {'\n'}• We are not liable for any health outcomes
          {'\n'}• We are not responsible for data loss or service interruptions
          {'\n'}• Our total liability is limited to the amount you paid (if any)
        </Text>

        <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          The App uses third-party services (Supabase, OpenAI) that have their own terms. By using the App, you also agree to comply with their terms.
        </Text>

        <Text style={styles.sectionTitle}>10. Wellness Guidance Only</Text>
        <Text style={styles.paragraph}>
          • All recommendations are for wellness optimization only
          {'\n'}• Supplement suggestions are educational, not prescriptive
          {'\n'}• Lifestyle recommendations are general guidance
          {'\n'}• Individual results will vary
          {'\n'}• Consult a healthcare provider before making changes
        </Text>

        <Text style={styles.sectionTitle}>11. Modifications to Service</Text>
        <Text style={styles.paragraph}>
          We reserve the right to:
          {'\n'}• Modify or discontinue features
          {'\n'}• Update pricing (with notice)
          {'\n'}• Change these Terms of Service
          {'\n'}• Suspend or terminate the service
        </Text>

        <Text style={styles.sectionTitle}>12. Termination</Text>
        <Text style={styles.paragraph}>
          • You may delete your account at any time
          {'\n'}• We may terminate accounts that violate these terms
          {'\n'}• Upon termination, your data will be deleted per our Privacy Policy
        </Text>

        <Text style={styles.sectionTitle}>13. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
        </Text>

        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, contact us at:
          {'\n\n'}Email: legal@hormoiq.com
          {'\n\n'}We will respond within 30 days.
        </Text>

        <Text style={styles.agreementText}>
          By using HormoIQ, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed for Aurora
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: DesignSystem.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[200],
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: DesignSystem.colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: DesignSystem.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: DesignSystem.colors.neutral[500],
    marginTop: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 24,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 12,
  },
  important: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 24,
    color: DesignSystem.colors.error,
    marginBottom: 12,
    padding: 16,
    backgroundColor: DesignSystem.colors.errorBackground,
    borderRadius: 8,
  },
  agreementText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    color: DesignSystem.colors.text.primary,
    marginTop: 24,
    padding: 16,
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

