import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorAlert } from '@/lib/errors';
import * as Haptics from 'expo-haptics';

const STRESS_LEVELS = [
  { value: 1, emoji: '😌', label: 'Relaxed' },
  { value: 2, emoji: '😊', label: 'Calm' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '😰', label: 'Stressed' },
  { value: 5, emoji: '😫', label: 'Very Stressed' },
] as const;

export default function ContextScreen() {
  const { hormone, value } = useLocalSearchParams<{ hormone: string; value: string }>();
  const { user } = useAuth();

  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [exercised, setExercised] = useState<boolean>(false);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [supplements, setSupplements] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !hormone || !value) {
      Alert.alert('Error', 'Missing required data');
      return;
    }

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSaving(true);

    try {
      // Save hormone test
      const { data: testData, error: testError } = await supabase
        .from('hormone_tests')
        .insert({
          user_id: user.id,
          hormone_type: hormone,
          value: parseFloat(value),
          timestamp: new Date().toISOString(),
          sleep_quality: sleepQuality,
          exercised,
          stress_level: stressLevel,
          supplements: supplements.trim() || null,
        })
        .select()
        .single();

      if (testError) throw testError;

      // Navigate to success screen with test data
      router.replace({
        pathname: '/test/success',
        params: {
          testId: testData.id,
          hormone,
          value,
        },
      });
    } catch (error) {
      showErrorAlert(error, 'Save Error');
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.title}>Add Context</Text>
          <Text style={styles.subtitle}>
            This helps us find patterns in your data
          </Text>
        </View>

        {/* Sleep Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <Text style={styles.sectionSubtitle}>How well did you sleep last night?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSleepQuality(star);
                }}
                style={styles.starButton}
              >
                <Text style={styles.star}>
                  {star <= sleepQuality ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.selectionText}>
            {sleepQuality === 1 && 'Very Poor'}
            {sleepQuality === 2 && 'Poor'}
            {sleepQuality === 3 && 'Average'}
            {sleepQuality === 4 && 'Good'}
            {sleepQuality === 5 && 'Excellent'}
          </Text>
        </View>

        {/* Exercise */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Exercise Today</Text>
              <Text style={styles.sectionSubtitle}>Did you exercise today?</Text>
            </View>
            <Switch
              value={exercised}
              onValueChange={setExercised}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={exercised ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Stress Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stress Level</Text>
          <Text style={styles.sectionSubtitle}>How stressed are you feeling?</Text>
          <View style={styles.stressContainer}>
            {STRESS_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStressLevel(level.value);
                }}
                style={[
                  styles.stressButton,
                  stressLevel === level.value && styles.stressButtonSelected,
                ]}
              >
                <Text style={styles.stressEmoji}>{level.emoji}</Text>
                <Text
                  style={[
                    styles.stressLabel,
                    stressLevel === level.value && styles.stressLabelSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Supplements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplements (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            List any supplements you're taking
          </Text>
          <TextInput
            style={styles.textInput}
            value={supplements}
            onChangeText={setSupplements}
            placeholder="e.g., Vitamin D, Zinc, Ashwagandha"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>
            💡 This helps us detect which supplements work for you
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            Your data is private and secure. We use it only to give you personalized insights.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Test</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
  },
  selectionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  stressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  stressButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 80,
    backgroundColor: '#fff',
  },
  stressButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  stressEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  stressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  stressLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 100,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

