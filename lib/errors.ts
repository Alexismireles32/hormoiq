/**
 * Error handling utilities for HormoIQ
 */

import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Show user-friendly error alert
 */
export function showErrorAlert(error: any, title: string = 'Error') {
  const message = getErrorMessage(error);
  Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
}

/**
 * Get user-friendly error message from any error type
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof AppError) {
    return error.message;
  }

  const message = error?.message || '';

  // Supabase/Auth errors
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email address';
  }
  if (message.includes('invalid claim')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Database errors
  if (message.includes('duplicate key')) {
    return 'This record already exists';
  }
  if (message.includes('foreign key constraint')) {
    return 'Related record not found';
  }
  if (message.includes('permission denied')) {
    return 'You do not have permission to perform this action';
  }
  if (message.includes('violates not-null constraint')) {
    return 'Required field is missing';
  }

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
    return 'Network error. Please check your connection.';
  }

  // OpenAI errors
  if (message.includes('API key')) {
    return 'AI service configuration error. Please contact support.';
  }
  if (message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Default
  return message || 'An unexpected error occurred';
}

/**
 * Log error to console in development
 */
export function logError(error: any, context?: string) {
  if (__DEV__) {
    console.error(`[${context || 'Error'}]`, error);
  }
  // In production, you'd send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

/**
 * Handle async errors with automatic user feedback
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  errorTitle?: string
): Promise<[T | null, any]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    logError(error, errorTitle);
    if (errorTitle) {
      showErrorAlert(error, errorTitle);
    }
    return [null, error];
  }
}

