import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { DesignSystem } from '@/constants/DesignSystem';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function PrivacyPolicyScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: November 9, 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          HormoIQ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        
        <Text style={styles.subsectionTitle}>2.1 Health Data</Text>
        <Text style={styles.paragraph}>
          We collect hormone test results that you manually enter into the app, including:
          {'\n'}• Cortisol levels
          {'\n'}• Testosterone levels  
          {'\n'}• DHEA levels
          {'\n'}• Progesterone levels
          {'\n'}• Test timestamps and context (sleep quality, exercise, stress)
        </Text>

        <Text style={styles.subsectionTitle}>2.2 Personal Information</Text>
        <Text style={styles.paragraph}>
          • Age and biological sex
          {'\n'}• Email address (for account purposes)
          {'\n'}• Hormone therapy status
          {'\n'}• Wellness goals
        </Text>

        <Text style={styles.subsectionTitle}>2.3 Usage Data</Text>
        <Text style={styles.paragraph}>
          • App usage patterns
          {'\n'}• Feature interactions
          {'\n'}• Error logs and performance data
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          • Calculate your ReadyScore™, BioAge™, and Impact™ analyses
          {'\n'}• Provide personalized AI coaching through ASK™
          {'\n'}• Track your hormone trends over time
          {'\n'}• Recommend wellness protocols
          {'\n'}• Improve app functionality and user experience
          {'\n'}• Send important updates about your account
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          • All data is encrypted in transit (HTTPS) and at rest
          {'\n'}• Stored securely on Supabase infrastructure
          {'\n'}• Access controlled through row-level security
          {'\n'}• Regular security audits performed
          {'\n'}• No data is shared with third parties for marketing
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
          {'\n'}• Access your personal data
          {'\n'}• Correct inaccurate data
          {'\n'}• Request data deletion
          {'\n'}• Export your data
          {'\n'}• Withdraw consent at any time
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days.
        </Text>

        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use the following services:
          {'\n'}• Supabase (database hosting)
          {'\n'}• OpenAI (AI coaching features)
          {'\n\n'}These services have their own privacy policies and we ensure they meet our data protection standards.
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is not intended for children under 13. We do not knowingly collect data from children.
        </Text>

        <Text style={styles.sectionTitle}>9. HIPAA Disclaimer</Text>
        <Text style={styles.paragraph}>
          HormoIQ is a wellness application and is NOT HIPAA compliant. This app is not intended for medical diagnosis or treatment. For medical advice, please consult a healthcare provider.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us at:
          {'\n\n'}Email: privacy@hormoiq.com
          {'\n\n'}We will respond to your inquiry within 30 days.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 24,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

