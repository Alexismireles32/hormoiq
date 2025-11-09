import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorAlert } from '@/lib/errors';
import { DesignSystem } from '@/constants/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const CURRENT_YEAR = new Date().getFullYear();

export default function OnboardingScreen() {
  const { user, isAnonymous } = useAuth();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number | null>(null);
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | null>(null);
  const [onHormoneTherapy, setOnHormoneTherapy] = useState<'yes' | 'no' | 'not_sure' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !age) {
      Alert.alert('Required', 'Please enter your age to continue');
      return;
    }
    if (step === 2 && !biologicalSex) {
      Alert.alert('Required', 'Please select your biological sex to continue');
      return;
    }
    if (step === 3 && !onHormoneTherapy) {
      Alert.alert('Required', 'Please indicate if you are on hormone therapy');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user || !age || !biologicalSex || !onHormoneTherapy) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create or update user profile
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        age: age,
        gender: biologicalSex,
        on_hormone_therapy: onHormoneTherapy === 'yes',
        hormone_therapy_unknown: onHormoneTherapy === 'not_sure',
        onboarding_completed: true,
      });

      if (error) throw error;

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      showErrorAlert(error, 'Onboarding Error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    Alert.alert(
      'Skip Onboarding',
      'We recommend completing these questions for accurate hormone range comparisons. Skip anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Set minimal defaults for anonymous users
              const { error } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                age: 30, // Default
                gender: 'male', // Default
                on_hormone_therapy: false,
                hormone_therapy_unknown: false,
                onboarding_completed: true,
              });

              if (error) throw error;
              router.replace('/(tabs)');
            } catch (error) {
              showErrorAlert(error, 'Skip Onboarding Error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Age selector with large buttons
  const renderAgeSelector = () => {
    const ageRanges = [
      { label: '18-24', value: 21 },
      { label: '25-34', value: 30 },
      { label: '35-44', value: 40 },
      { label: '45-54', value: 50 },
      { label: '55-64', value: 60 },
      { label: '65+', value: 70 },
    ];

    return (
      <View style={styles.optionsContainer}>
        {ageRanges.map((range) => (
          <TouchableOpacity
            key={range.label}
            style={[
              styles.optionButton,
              age === range.value && styles.optionButtonActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAge(range.value);
            }}
          >
            {age === range.value && (
              <LinearGradient
                colors={DesignSystem.colors.gradients.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Text
              style={[
                styles.optionText,
                age === range.value && styles.optionTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={DesignSystem.colors.gradients.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>Question {step} of 3</Text>
          {isAnonymous && (
            <TouchableOpacity onPress={handleSkip} disabled={loading}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question 1: Age */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.icon}>🎂</Text>
            <Text style={styles.title}>How old are you?</Text>
            <Text style={styles.subtitle}>
              Hormone ranges change significantly with age. This ensures accurate comparisons to age-appropriate levels.
            </Text>
            <Text style={styles.medicalNote}>
              ⚕️ Medically Required for Accuracy
            </Text>

            {renderAgeSelector()}
          </View>
        )}

        {/* Question 2: Biological Sex */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.icon}>👤</Text>
            <Text style={styles.title}>What is your biological sex?</Text>
            <Text style={styles.subtitle}>
              Hormone levels vary significantly between males and females. This is essential for accurate range comparisons.
            </Text>
            <Text style={styles.medicalNote}>
              ⚕️ Critical for Result Interpretation
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  biologicalSex === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBiologicalSex('male');
                }}
              >
                {biologicalSex === 'male' && (
                  <LinearGradient
                    colors={DesignSystem.colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.genderIcon}>👨</Text>
                <Text
                  style={[
                    styles.genderText,
                    biologicalSex === 'male' && styles.genderTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  biologicalSex === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBiologicalSex('female');
                }}
              >
                {biologicalSex === 'female' && (
                  <LinearGradient
                    colors={DesignSystem.colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.genderIcon}>👩</Text>
                <Text
                  style={[
                    styles.genderText,
                    biologicalSex === 'female' && styles.genderTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Question 3: Hormone Therapy */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.icon}>💊</Text>
            <Text style={styles.title}>Are you currently taking any hormone therapy?</Text>
            <Text style={styles.subtitle}>
              This includes testosterone replacement (TRT), hormone replacement therapy (HRT), birth control, or other hormone medications.
            </Text>
            <Text style={styles.medicalNote}>
              ⚕️ Helps Us Interpret Your Results Correctly
            </Text>

            <View style={styles.optionsContainer}>
              {[
                { value: 'no', label: 'No', icon: '✓' },
                { value: 'yes', label: 'Yes', icon: '💊' },
                { value: 'not_sure', label: 'Not Sure', icon: '❓' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.therapyButton,
                    onHormoneTherapy === option.value && styles.therapyButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOnHormoneTherapy(option.value as any);
                  }}
                >
                  {onHormoneTherapy === option.value && (
                    <LinearGradient
                      colors={DesignSystem.colors.gradients.primary as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={styles.therapyIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.therapyText,
                      onHormoneTherapy === option.value && styles.therapyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <LinearGradient
              colors={DesignSystem.colors.gradients.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Complete ✓' : 'Next →'}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  progressContainer: {
    paddingTop: DesignSystem.spacing[12],
    paddingHorizontal: DesignSystem.spacing[6],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.neutral[0],
  },
  progressBar: {
    height: 6,
    backgroundColor: DesignSystem.colors.neutral[200],
    borderRadius: DesignSystem.radius.full,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing[3],
  },
  progressFill: {
    height: '100%',
    borderRadius: DesignSystem.radius.full,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  skipText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.primary[500],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  stepContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 72,
    marginBottom: DesignSystem.spacing[6],
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['3xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[4],
    lineHeight: DesignSystem.typography.fontSize['3xl'] * DesignSystem.typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[3],
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  medicalNote: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.primary[600],
    textAlign: 'center',
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing[8],
    backgroundColor: DesignSystem.colors.primary[50],
    paddingHorizontal: DesignSystem.spacing[4],
    paddingVertical: DesignSystem.spacing[2],
    borderRadius: DesignSystem.radius.md,
  },
  optionsContainer: {
    width: '100%',
    gap: DesignSystem.spacing[3],
  },
  optionButton: {
    paddingVertical: DesignSystem.spacing[5],
    paddingHorizontal: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[300],
    backgroundColor: DesignSystem.colors.neutral[0],
    alignItems: 'center',
    overflow: 'hidden',
    ...DesignSystem.shadows.sm,
  },
  optionButtonActive: {
    borderColor: DesignSystem.colors.primary[500],
    ...DesignSystem.shadows.lg,
  },
  optionText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
  },
  optionTextActive: {
    color: DesignSystem.colors.neutral[0],
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing[6],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[300],
    backgroundColor: DesignSystem.colors.neutral[0],
    overflow: 'hidden',
    ...DesignSystem.shadows.sm,
  },
  genderButtonActive: {
    borderColor: DesignSystem.colors.primary[500],
    ...DesignSystem.shadows.lg,
  },
  genderIcon: {
    fontSize: 40,
    marginRight: DesignSystem.spacing[3],
  },
  genderText: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[700],
  },
  genderTextActive: {
    color: DesignSystem.colors.neutral[0],
  },
  therapyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing[5],
    paddingHorizontal: DesignSystem.spacing[6],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[300],
    backgroundColor: DesignSystem.colors.neutral[0],
    overflow: 'hidden',
    ...DesignSystem.shadows.sm,
  },
  therapyButtonActive: {
    borderColor: DesignSystem.colors.primary[500],
    ...DesignSystem.shadows.lg,
  },
  therapyIcon: {
    fontSize: 28,
    marginRight: DesignSystem.spacing[3],
  },
  therapyText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
  },
  therapyTextActive: {
    color: DesignSystem.colors.neutral[0],
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: DesignSystem.spacing[6],
    gap: DesignSystem.spacing[3],
    backgroundColor: DesignSystem.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[200],
  },
  backButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.xl,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
  },
  nextButton: {
    flex: 2,
    borderRadius: DesignSystem.radius.xl,
    overflow: 'hidden',
    ...DesignSystem.shadows.lg,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    paddingVertical: DesignSystem.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[0],
  },
});
