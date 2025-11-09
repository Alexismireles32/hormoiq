/**
 * Content Sanitization Utilities
 * Protects against XSS and malicious content in user-generated and AI-generated text
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Used for AI responses and any user-generated content
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

/**
 * Sanitize plain text (removes all HTML)
 * Used for fields that should contain no markup
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM: false,
  });
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
 * Allows basic formatting but prevents XSS
 */
export function sanitizeAIResponse(response: string): string {
  if (!response) return '';
  
  // Allow basic formatting tags
  return DOMPurify.sanitize(response, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
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

