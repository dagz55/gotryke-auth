import crypto from 'crypto';
import { headers } from 'next/headers';

/**
 * Security utilities for GoTryke authentication system
 */

// Phone number validation for Philippines
export const PHONE_REGEX = /^9[0-9]{9}$/;
export const PIN_REGEX = /^[0-9]{6}$/;
export const OTP_REGEX = /^[0-9]{6}$/;

/**
 * Sanitize and validate Philippine phone number
 */
export function validatePhoneNumber(phone: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-numeric characters
  const sanitized = phone.replace(/\D/g, '');

  // Check if it starts with country code
  if (sanitized.startsWith('63')) {
    const localNumber = sanitized.substring(2);
    if (PHONE_REGEX.test(localNumber)) {
      return { valid: true, sanitized: localNumber };
    }
  }

  // Check if it starts with 0 (local format)
  if (sanitized.startsWith('0')) {
    const localNumber = sanitized.substring(1);
    if (PHONE_REGEX.test(localNumber)) {
      return { valid: true, sanitized: localNumber };
    }
  }

  // Check if it's already in correct format
  if (PHONE_REGEX.test(sanitized) && sanitized.length === 10) {
    return { valid: true, sanitized };
  }

  return { 
    valid: false, 
    error: 'Invalid Philippine phone number format. Use 09XXXXXXXXX or 9XXXXXXXXX' 
  };
}

/**
 * Validate PIN format
 */
export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, error: 'PIN is required' };
  }

  if (!PIN_REGEX.test(pin)) {
    return { valid: false, error: 'PIN must be exactly 6 digits' };
  }

  return { valid: true };
}

/**
 * Validate OTP format
 */
export function validateOtp(otp: string): { valid: boolean; error?: string } {
  if (!otp || typeof otp !== 'string') {
    return { valid: false, error: 'OTP is required' };
  }

  if (!OTP_REGEX.test(otp)) {
    return { valid: false, error: 'OTP must be exactly 6 digits' };
  }

  return { valid: true };
}

/**
 * Validate user name
 */
export function validateName(name: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  // Remove extra whitespace and limit length
  const sanitized = name.trim().slice(0, 100);
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  // Check for potentially malicious characters
  if (/<script|javascript:|data:/i.test(sanitized)) {
    return { valid: false, error: 'Invalid characters in name' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate user role
 */
const VALID_ROLES = ['admin', 'dispatcher', 'guide', 'passenger', 'rider'] as const;
export type UserRole = typeof VALID_ROLES[number];

export function validateRole(role: string): { valid: boolean; role?: UserRole; error?: string } {
  if (!role || typeof role !== 'string') {
    return { valid: false, error: 'Role is required' };
  }

  if (!VALID_ROLES.includes(role as UserRole)) {
    return { valid: false, error: 'Invalid user role' };
  }

  return { valid: true, role: role as UserRole };
}

/**
 * Generate cryptographically secure OTP
 */
export function generateSecureOtp(length: number = 6): string {
  const max = Math.pow(10, length) - 1;
  const min = Math.pow(10, length - 1);
  
  // Generate random bytes and convert to number within range
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const otp = (randomNumber % (max - min + 1)) + min;
  
  return otp.toString().padStart(length, '0');
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash sensitive data with salt
 */
export async function hashSensitiveData(data: string, salt?: string): Promise<string> {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(data, actualSalt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${actualSalt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify hashed sensitive data
 */
export async function verifySensitiveData(data: string, hash: string): Promise<boolean> {
  const [salt, originalHash] = hash.split(':');
  if (!salt || !originalHash) return false;
  
  try {
    const newHash = await hashSensitiveData(data, salt);
    const [, newHashValue] = newHash.split(':');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(newHashValue, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Get client IP address securely
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  
  // Check various headers for IP address
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip', 
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'true-client-ip',
    'x-cluster-client-ip'
  ];

  for (const header of possibleHeaders) {
    const value = headersList.get(header);
    if (value) {
      // Take first IP if comma-separated
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  return 'unknown';
}

/**
 * Validate IP address format
 */
function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Check if request is from suspicious source
 */
export function isRequestSuspicious(userAgent?: string, ip?: string): boolean {
  if (!userAgent) return true;
  
  // Allow curl in development for testing
  if (process.env.NODE_ENV === 'development' && userAgent.includes('curl')) {
    return false;
  }
  
  // Block common bot patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /postman/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Sanitize string for logging (remove sensitive data)
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = ['pin', 'password', 'otp', 'token', 'secret', 'key'];
  const sanitized: any = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = '***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
} as const;