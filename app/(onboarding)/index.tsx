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
import { generateTestSchedule, saveScheduleToDatabase, getPatternExplanation } from '@/lib/scheduleGenerator';

const CURRENT_YEAR = new Date().getFullYear();

export default function OnboardingScreen() {
  const { user, isAnonymous } = useAuth();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number | null>(null);
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | null>(null);
  const [onHormoneTherapy, setOnHormoneTherapy] = useState<'yes' | 'no' | 'not_sure' | null>(null);
  // Step 4: Test Schedule
  const [kitReceived, setKitReceived] = useState<boolean | null>(null);
  const [kitDate, setKitDate] = useState<Date>(new Date());
  const [schedulePattern, setSchedulePattern] = useState<'A' | 'B' | null>(null);
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
    if (step === 4 && kitReceived === null) {
      Alert.alert('Required', 'Please indicate if you have received your test kit');
      return;
    }
    if (step === 4 && kitReceived && !schedulePattern) {
      Alert.alert('Required', 'Please select a testing schedule');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step < 4) {
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
      // Get fresh session to ensure we have the latest user data with email
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const userEmail = freshSession?.user?.email || user.email || null;
      
      console.log('Starting onboarding for user:', user.id, 'email:', userEmail);
      
      // First, check if user exists by ID
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', user.id)
        .maybeSingle();

      // Ignore PGRST116 (no rows found) - it's expected for new users
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking user:', checkError);
      }

      console.log('Existing user check:', existingUser ? 'FOUND' : 'NOT FOUND');

      // Also check if email exists (different user ID with same email - edge case)
      let emailExists = null;
      if (userEmail) {
        const { data } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', userEmail)
          .maybeSingle();
        emailExists = data;
      }

      console.log('Email exists check:', emailExists);

      const userData = {
        id: user.id,
        email: userEmail,
        age: age,
        gender: biologicalSex,
        on_hormone_therapy: onHormoneTherapy === 'yes',
        hormone_therapy_unknown: onHormoneTherapy === 'not_sure',
        onboarding_completed: true,
        // Schedule fields
        kit_received_date: kitReceived ? kitDate.toISOString().split('T')[0] : null,
        test_schedule_pattern: schedulePattern,
        test_schedule_start_week: 1,
        tests_remaining: kitReceived ? 12 : 12, // Always 12, will decrement as they test
      };

      let result;
      if (existingUser || emailExists) {
        // Update existing user (use the ID we found)
        const targetId = existingUser?.id || emailExists?.id;
        console.log('Updating existing user with ID:', targetId);
        result = await supabase
          .from('users')
          .update(userData)
          .eq('id', targetId);
      } else {
        // Insert new user
        console.log('Inserting new user...');
        result = await supabase
          .from('users')
          .insert(userData);
      }

      if (result.error) {
        console.error('Onboarding error:', JSON.stringify(result.error, null, 2));
        throw result.error;
      }

      console.log('Onboarding successful!');
      
      // Generate test schedule if kit received and pattern selected
      if (kitReceived && schedulePattern && biologicalSex) {
        console.log('Generating test schedule...');
        const schedule = generateTestSchedule(
          kitDate,
          schedulePattern,
          biologicalSex,
        );
        
        const scheduleResult = await saveScheduleToDatabase(user.id, schedule);
        
        if (scheduleResult.success) {
          console.log('Test schedule created successfully!');
        } else {
          console.error('Failed to create schedule:', scheduleResult.error);
          // Don't block onboarding if schedule fails - they can set it later
        }
      }
      
      // Force reload to update profile state
      // Use a small delay to ensure database write completes
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Onboarding catch error:', error);
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
              // Check if user exists (maybeSingle doesn't throw)
              const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

              // Ignore PGRST116 (no rows found)
              if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking user:', checkError);
              }

              const userData = {
                id: user.id,
                email: user.email,
                age: 30, // Default
                gender: 'male', // Default
                on_hormone_therapy: false,
                hormone_therapy_unknown: false,
                onboarding_completed: true,
              };

              let result;
              if (existingUser) {
                // Update existing user
                console.log('Updating existing user (skip)...');
                result = await supabase
                  .from('users')
                  .update(userData)
                  .eq('id', user.id);
              } else {
                // Insert new user
                console.log('Inserting new user (skip)...');
                result = await supabase
                  .from('users')
                  .insert(userData);
              }

              if (result.error) {
                console.error('Skip onboarding error:', JSON.stringify(result.error, null, 2));
                throw result.error;
              }
              
              console.log('Skip onboarding successful!');
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Skip onboarding catch error:', error);
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
            style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>Question {step} of 4</Text>
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

        {/* Question 4: Test Schedule */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.icon}>🗓️</Text>
            <Text style={styles.title}>Have you received your test kit?</Text>
            <Text style={styles.subtitle}>
              Your kit includes 12 hormone tests to use over 4 weeks (3 tests per week).
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.therapyButton,
                  kitReceived === true && styles.therapyButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setKitReceived(true);
                }}
              >
                {kitReceived === true && (
                  <LinearGradient
                    colors={DesignSystem.colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.therapyIcon}>✓</Text>
                <Text
                  style={[
                    styles.therapyText,
                    kitReceived === true && styles.therapyTextActive,
                  ]}
                >
                  Yes, I have it
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.therapyButton,
                  kitReceived === false && styles.therapyButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setKitReceived(false);
                  setSchedulePattern(null);
                }}
              >
                {kitReceived === false && (
                  <LinearGradient
                    colors={DesignSystem.colors.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.therapyIcon}>📦</Text>
                <Text
                  style={[
                    styles.therapyText,
                    kitReceived === false && styles.therapyTextActive,
                  ]}
                >
                  Not yet (on the way)
                </Text>
              </TouchableOpacity>
            </View>

            {kitReceived && (
              <>
                <Text style={[styles.title, { marginTop: DesignSystem.spacing[8] }]}>
                  Choose your testing schedule
                </Text>
                <Text style={styles.subtitle}>
                  We alternate days to cover the entire week, giving the most accurate hormone patterns. Pick your starting days:
                </Text>

                <View style={styles.scheduleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.patternCard,
                      schedulePattern === 'A' && styles.patternCardActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSchedulePattern('A');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.patternHeader}>
                      <Text style={styles.patternLabel}>Pattern A (Recommended)</Text>
                      {schedulePattern === 'A' && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.patternDays}>Mon · Wed · Fri</Text>
                    <Text style={styles.patternThen}>then</Text>
                    <Text style={styles.patternDays}>Tue · Thu · Sat</Text>
                    <Text style={styles.patternExplanation}>
                      Start your week strong, covers all 7 days
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.patternCard,
                      schedulePattern === 'B' && styles.patternCardActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSchedulePattern('B');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.patternHeader}>
                      <Text style={styles.patternLabel}>Pattern B</Text>
                      {schedulePattern === 'B' && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.patternDays}>Tue · Thu · Sat</Text>
                    <Text style={styles.patternThen}>then</Text>
                    <Text style={styles.patternDays}>Mon · Wed · Fri</Text>
                    <Text style={styles.patternExplanation}>
                      Alternative schedule, also covers all 7 days
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleInfoIcon}>💡</Text>
                  <Text style={styles.scheduleInfoText}>
                    We'll send reminders for each test. You can always test on different days if needed!
                  </Text>
                </View>
              </>
            )}

            {kitReceived === false && (
              <View style={styles.noKitInfo}>
                <Text style={styles.noKitIcon}>📬</Text>
                <Text style={styles.noKitTitle}>No problem!</Text>
                <Text style={styles.noKitText}>
                  You can set up your testing schedule once your kit arrives. We'll guide you through it.
                </Text>
              </View>
            )}
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
                {step === 4 ? 'Complete ✓' : 'Next →'}
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
  // Step 4: Schedule styles
  scheduleContainer: {
    width: '100%',
    gap: DesignSystem.spacing[3],
    marginTop: DesignSystem.spacing[4],
  },
  patternCard: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[300],
    padding: DesignSystem.spacing[5],
    alignItems: 'center',
    ...DesignSystem.shadows.sm,
  },
  patternCardActive: {
    borderColor: DesignSystem.colors.primary[500],
    borderWidth: 3,
    ...DesignSystem.shadows.md,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: DesignSystem.spacing[3],
  },
  patternLabel: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
  },
  checkmark: {
    fontSize: 24,
    color: DesignSystem.colors.primary[600],
  },
  patternDays: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary[600],
    letterSpacing: 2,
  },
  patternThen: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[500],
    marginVertical: DesignSystem.spacing[2],
  },
  patternExplanation: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    marginTop: DesignSystem.spacing[2],
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.accent,
    padding: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.lg,
    marginTop: DesignSystem.spacing[4],
    gap: DesignSystem.spacing[2],
  },
  scheduleInfoIcon: {
    fontSize: 20,
  },
  scheduleInfoText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[700],
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  noKitInfo: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.accent,
    padding: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.xl,
    marginTop: DesignSystem.spacing[6],
  },
  noKitIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing[4],
  },
  noKitTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  noKitText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
});
