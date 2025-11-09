/**
 * Content Sanitization Utilities
 * Protects against XSS and malicious content in user-generated and AI-generated text
 * React Native compatible - no DOM dependencies
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * React Native version - strips HTML tags
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  
  // Remove HTML tags - React Native doesn't render HTML anyway
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize plain text (removes all HTML and special characters)
 * Used for fields that should contain no markup
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');
  
  return clean;
}

/**
 * Validate and sanitize supplement field
 * Max 200 characters, no HTML, basic text only
 */
export function sanitizeSupplement(supplement: string): string {
  if (!supplement) return '';
  
  // Remove HTML
  let clean = sanitizeText(supplement);
  
  // Trim whitespace
  clean = clean.trim();
  
  // Enforce max length
  if (clean.length > 200) {
    clean = clean.substring(0, 200);
  }
  
  return clean;
}

/**
 * Validate and sanitize chat message
 * Max 500 characters, basic text only
 */
export function sanitizeChatMessage(message: string): string {
  if (!message) return '';
  
  // Remove HTML
  let clean = sanitizeText(message);
  
  // Trim whitespace
  clean = clean.trim();
  
  // Enforce max length
  if (clean.length > 500) {
    clean = clean.substring(0, 500);
  }
  
  return clean;
}

/**
 * Sanitize AI response
 * React Native version - strips dangerous content but allows text
 */
export function sanitizeAIResponse(response: string): string {
  if (!response) return '';
  
  // Remove HTML tags (React Native Text doesn't render HTML anyway)
  let clean = response.replace(/<[^>]*>/g, '');
  
  // Remove script-like content
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');
  
  return clean;
}

/**
 * Validate email format (basic)
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate 3-digit code (not all zeros, not sequential)
 */
export function validateCode(code: string): boolean {
  if (!code || code.length !== 3) return false;
  
  // Check if all same digit (000, 111, 222, etc.)
  if (code[0] === code[1] && code[1] === code[2]) return false;
  
  // Check if sequential (123, 234, 345, etc.)
  const digits = code.split('').map(Number);
  if (digits[1] === digits[0] + 1 && digits[2] === digits[1] + 1) return false;
  if (digits[1] === digits[0] - 1 && digits[2] === digits[1] - 1) return false;
  
  return true;
}

/**
 * Sanitize and validate age
 */
export function validateAge(age: number | null): boolean {
  if (age === null || age === undefined) return false;
  return age >= 10 && age <= 120;
}

/**
 * Sanitize protocol name
 */
export function sanitizeProtocolName(name: string): string {
  if (!name) return '';
  
  let clean = sanitizeText(name);
  clean = clean.trim();
  
  // Max 100 characters
  if (clean.length > 100) {
    clean = clean.substring(0, 100);
  }
  
  return clean;
}

/**
 * Validate hormone value is within safe range
 */
export function validateHormoneValue(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

