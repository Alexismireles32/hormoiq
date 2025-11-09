import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!code || code.length !== 3) {
      Alert.alert('Error', 'Please enter a 3-digit code');
      return;
    }

    setLoading(true);
    
    try {
      // Match the sign-up format
      const testEmail = `user${code}@test-hormoiq.local`;
      const testPassword = `TestPass${code}!2024`;

      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Sign In Error', 'Code not found. Please sign up first.');
      return;
    }
    
    setLoading(false);
    // Success - navigation handled by AuthContext
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your 3-digit code</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 3-digit code (e.g., 332)"
          value={code}
          onChangeText={(text) => {
            // Only allow numbers and max 3 digits
            const numericText = text.replace(/[^0-9]/g, '').slice(0, 3);
            setCode(numericText);
          }}
          keyboardType="number-pad"
          maxLength={3}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

