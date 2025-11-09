import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, signOut, isAnonymous } = useAuth();
  const { isAdmin } = useAdmin();
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('age, gender')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setAge(data.age?.toString() || '30');
        setGender(data.gender || 'male');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 10 and 120.');
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          age: ageNum,
          gender,
          email: user.email,
        });
      if (error) throw error;
      Alert.alert('Success', 'Profile updated! 🎉');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleReplayTour = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await AsyncStorage.removeItem('tour_completed');
      Alert.alert('Tour Reset', 'Please restart the app to see the tour again.', [
        { text: 'OK' }
      ]);
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  const handleShowTutorial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)',
      params: { showTutorial: 'true' }
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.email}>
            {isAnonymous ? 'Guest User' : user?.email}
          </Text>
          {isAnonymous && (
            <Text style={styles.anonymousLabel}>
              Anonymous • Your data is saved on this device
            </Text>
          )}
        </View>

        {/* Account Creation for Anonymous Users */}
        {isAnonymous && (
          <View style={styles.accountPrompt}>
            <Text style={styles.accountPromptIcon}>🔐</Text>
            <Text style={styles.accountPromptTitle}>Save Your Data Forever</Text>
            <Text style={styles.accountPromptText}>
              Create an account to sync your data across devices and never lose it.
            </Text>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Coming Soon',
                  'Account creation via Shopify email + order number will be available soon!'
                );
              }}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bio Info for BIOAGE™ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio Information (for BIOAGE™) 🧬</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor={DesignSystem.colors.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    gender === g && styles.genderButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGender(g);
                  }}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === g && styles.genderButtonTextActive,
                    ]}
                  >
                    {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Admin Panel Access */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/admin/dashboard');
            }}
          >
            <Text style={styles.adminButtonIcon}>🛠️</Text>
            <View style={styles.adminButtonContent}>
              <Text style={styles.adminButtonTitle}>Admin Panel</Text>
              <Text style={styles.adminButtonSubtitle}>Manage system and users</Text>
            </View>
            <Text style={styles.adminButtonArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {user?.id}
            </Text>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <TouchableOpacity style={styles.helpButton} onPress={handleShowTutorial}>
            <Text style={styles.helpIcon}>🧪</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Test Strip Tutorial</Text>
              <Text style={styles.helpDescription}>Learn how to use your hormone test strips</Text>
            </View>
            <Text style={styles.helpArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton} onPress={handleReplayTour}>
            <Text style={styles.helpIcon}>👋</Text>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>App Tour</Text>
              <Text style={styles.helpDescription}>Reset and replay the guided tour</Text>
            </View>
            <Text style={styles.helpArrow}>↻</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: DesignSystem.spacing[12] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing[6],
    paddingTop: DesignSystem.spacing[12],
    paddingBottom: DesignSystem.spacing[4],
    backgroundColor: DesignSystem.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[200],
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[900],
  },
  headerTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: DesignSystem.spacing[6],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[8],
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[4],
    ...DesignSystem.shadows.lg,
  },
  avatarText: {
    fontSize: 48,
    color: DesignSystem.colors.primary[600],
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  email: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  anonymousLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
  },
  accountPrompt: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    marginBottom: DesignSystem.spacing[6],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignSystem.colors.primary[200],
  },
  accountPromptIcon: {
    fontSize: 48,
    marginBottom: DesignSystem.spacing[3],
  },
  accountPromptTitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[2],
  },
  accountPromptText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[700],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[4],
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.relaxed,
  },
  createAccountButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[3],
    borderRadius: DesignSystem.radius.md,
    ...DesignSystem.shadows.DEFAULT,
  },
  createAccountButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  section: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    marginBottom: DesignSystem.spacing[6],
    ...DesignSystem.shadows.DEFAULT,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[4],
  },
  inputGroup: {
    marginBottom: DesignSystem.spacing[5],
  },
  inputLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
    marginBottom: DesignSystem.spacing[2],
  },
  input: {
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.neutral[300],
    borderRadius: DesignSystem.radius.md,
    padding: DesignSystem.spacing[4],
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.neutral[900],
    backgroundColor: DesignSystem.colors.neutral[0],
  },
  genderButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  genderButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.md,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.neutral[300],
    backgroundColor: DesignSystem.colors.neutral[0],
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderColor: DesignSystem.colors.primary[500],
  },
  genderButtonText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[700],
  },
  genderButtonTextActive: {
    color: DesignSystem.colors.primary[700],
  },
  saveButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.md,
    alignItems: 'center',
    ...DesignSystem.shadows.DEFAULT,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.warning.light,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[5],
    marginBottom: DesignSystem.spacing[6],
    borderWidth: 2,
    borderColor: DesignSystem.colors.warning.DEFAULT,
  },
  adminButtonIcon: {
    fontSize: 32,
    marginRight: DesignSystem.spacing[4],
  },
  adminButtonContent: {
    flex: 1,
  },
  adminButtonTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  adminButtonSubtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
  },
  adminButtonArrow: {
    fontSize: 24,
    color: DesignSystem.colors.neutral[900],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DesignSystem.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.neutral[100],
  },
  infoLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[600],
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.neutral[900],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    marginBottom: DesignSystem.spacing[3],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  helpIcon: {
    fontSize: DesignSystem.iconSize.lg,
    marginRight: DesignSystem.spacing[4],
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[1],
  },
  helpDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
  },
  helpArrow: {
    fontSize: DesignSystem.iconSize.md,
    color: DesignSystem.colors.neutral[400],
    marginLeft: DesignSystem.spacing[2],
  },
  signOutButton: {
    backgroundColor: DesignSystem.colors.error.light,
    paddingVertical: DesignSystem.spacing[4],
    borderRadius: DesignSystem.radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.error.DEFAULT,
    marginTop: DesignSystem.spacing[8],
  },
  signOutText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.error.DEFAULT,
  },
});
