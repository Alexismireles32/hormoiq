/**
 * Data Export Utilities for GDPR Compliance
 * Allows users to export all their personal data
 */

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

interface ExportData {
  exportDate: string;
  userData: {
    profile: any;
    hormoneTests: any[];
    readyScores: any[];
    bioAges: any[];
    impactAnalyses: any[];
    protocols: any[];
    chatMessages: any[];
    scheduleEvents: any[];
  };
}

/**
 * Export all user data as JSON file
 */
export async function exportUserData(userId: string): Promise<void> {
  try {
    // Fetch all user data
    const [
      { data: profile },
      { data: hormoneTests },
      { data: readyScores },
      { data: bioAges },
      { data: impactAnalyses },
      { data: userProtocols },
      { data: chatMessages },
      { data: scheduleEvents },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('hormone_tests').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
      supabase.from('ready_scores').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('bio_ages').select('*').eq('user_id', userId).order('calculated_at', { ascending: false }),
      supabase.from('impact_analyses').select('*').eq('user_id', userId).order('calculated_at', { ascending: false }),
      supabase.from('user_protocols').select('*, protocol:protocols(*)').eq('user_id', userId),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('timestamp', { ascending: true }),
      supabase.from('test_schedule_events').select('*').eq('user_id', userId).order('scheduled_date', { ascending: true }),
    ]);

    // Create export object
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      userData: {
        profile: profile || {},
        hormoneTests: hormoneTests || [],
        readyScores: readyScores || [],
        bioAges: bioAges || [],
        impactAnalyses: impactAnalyses || [],
        protocols: userProtocols || [],
        chatMessages: chatMessages || [],
        scheduleEvents: scheduleEvents || [],
      },
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `HormoIQ_Data_Export_${timestamp}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Export Complete',
        `Your data has been exported to:\n${fileUri}\n\nPlease use a file manager to access it.`
      );
      return;
    }

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Your HormoIQ Data',
      UTI: 'public.json',
    });

    Alert.alert(
      'Export Successful',
      'Your data has been exported. You can save it to your device or share it.'
    );

  } catch (error) {
    console.error('Error exporting data:', error);
    Alert.alert(
      'Export Failed',
      'There was an error exporting your data. Please try again.'
    );
    throw error;
  }
}

/**
 * Generate a human-readable summary of user data
 */
export async function generateDataSummary(userId: string): Promise<string> {
  try {
    const [
      { data: profile },
      { data: hormoneTests },
      { data: readyScores },
      { data: bioAges },
      { data: chatMessages },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('hormone_tests').select('*').eq('user_id', userId),
      supabase.from('ready_scores').select('*').eq('user_id', userId),
      supabase.from('bio_ages').select('*').eq('user_id', userId),
      supabase.from('chat_messages').select('*').eq('user_id', userId),
    ]);

    const summary = `
HormoIQ Data Summary
====================

Account Created: ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
Age: ${profile?.age || 'Not set'}
Gender: ${profile?.gender || 'Not set'}

Data Statistics:
----------------
Hormone Tests: ${hormoneTests?.length || 0}
ReadyScores: ${readyScores?.length || 0}
BioAge Calculations: ${bioAges?.length || 0}
AI Chat Messages: ${chatMessages?.length || 0}

Most Recent Test: ${hormoneTests && hormoneTests[0] ? new Date(hormoneTests[0].timestamp).toLocaleDateString() : 'None'}
Latest ReadyScore: ${readyScores && readyScores[0] ? readyScores[0].score : 'Not calculated'}
Latest BioAge: ${bioAges && bioAges[0] ? `${bioAges[0].biological_age} years` : 'Not calculated'}
    `.trim();

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

/**
 * Delete all user data (GDPR right to be forgotten)
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  try {
    // Delete from all tables (CASCADE should handle most)
    await Promise.all([
      supabase.from('hormone_tests').delete().eq('user_id', userId),
      supabase.from('ready_scores').delete().eq('user_id', userId),
      supabase.from('bio_ages').delete().eq('user_id', userId),
      supabase.from('impact_analyses').delete().eq('user_id', userId),
      supabase.from('user_protocols').delete().eq('user_id', userId),
      supabase.from('chat_messages').delete().eq('user_id', userId),
      supabase.from('test_schedule_events').delete().eq('user_id', userId),
      supabase.from('user_patterns').delete().eq('user_id', userId),
    ]);

    // Finally delete user profile
    await supabase.from('users').delete().eq('id', userId);

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Error deleting auth user:', error);
    }

    Alert.alert(
      'Account Deleted',
      'All your data has been permanently deleted. You will be signed out.'
    );
  } catch (error) {
    console.error('Error deleting user data:', error);
    Alert.alert(
      'Deletion Failed',
      'There was an error deleting your data. Please contact support.'
    );
    throw error;
  }
}

