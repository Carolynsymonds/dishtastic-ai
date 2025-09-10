import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')
  .refine(
    (email) => {
      // Block common temporary email domains
      const tempEmailDomains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'throwaway.email'
      ];
      const domain = email.split('@')[1]?.toLowerCase();
      return !tempEmailDomains.includes(domain);
    },
    { message: 'Temporary email addresses are not allowed' }
  );

// Strong password validation schema
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .max(128, 'Password is too long')
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine((password) => !/(.)\1{2,}/.test(password), {
    message: 'Password cannot contain repeated characters',
  })
  .refine((password) => {
    // Check against common weak passwords
    const weakPasswords = [
      'password123',
      '123456789',
      'qwerty123',
      'admin123',
      'welcome123'
    ];
    return !weakPasswords.includes(password.toLowerCase());
  }, {
    message: 'Password is too common, please choose a stronger one',
  });

// Auth form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>"/\\]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim().slice(0, 254);
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return {
    isAllowed: (identifier: string): boolean => {
      const now = Date.now();
      const record = attempts.get(identifier);

      if (!record || now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (record.count >= maxAttempts) {
        return false;
      }

      record.count++;
      return true;
    },
    
    getRemainingTime: (identifier: string): number => {
      const record = attempts.get(identifier);
      if (!record) return 0;
      return Math.max(0, record.resetTime - Date.now());
    }
  };
};

// Auth attempt rate limiter (5 attempts per 15 minutes)
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);