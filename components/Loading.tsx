import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * Loading Component
 * Shows activity indicator with optional message
 */
export function Loading({ message, size = 'large', fullScreen = false }: LoadingProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={[containerStyle, styles.container]}>
      <ActivityIndicator size={size} color="#007AFF" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

/**
 * Full Page Loading Screen
 */
export function LoadingScreen({ message }: { message?: string }) {
  return <Loading message={message} fullScreen />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inline: {
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

