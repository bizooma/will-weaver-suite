// Security configuration and utilities
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    AUTH_ATTEMPTS: {
      max: 5,
      window: 15 * 60 * 1000, // 15 minutes
    },
    DRAFT_CREATION: {
      max: 10,
      window: 60 * 1000, // 1 minute
    },
    CONTACT_FORM: {
      max: 3,
      window: 60 * 60 * 1000, // 1 hour
    },
  },
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://fmcgsxdtyvssvwtxufll.supabase.co"],
  },
  
  // Input validation limits
  INPUT_LIMITS: {
    EMAIL_MAX_LENGTH: 320,
    PASSWORD_MIN_LENGTH: 6,
    TEXT_FIELD_MAX: 1000,
    NAME_MAX_LENGTH: 100,
  },
};

// Rate limiting utility (client-side basic protection)
class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - attempt.firstAttempt > windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (attempt.count >= maxAttempts) {
      return false;
    }

    // Increment count
    attempt.count++;
    return true;
  }

  getRemainingAttempts(key: string, maxAttempts: number): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return maxAttempts;
    return Math.max(0, maxAttempts - attempt.count);
  }

  getTimeUntilReset(key: string, windowMs: number): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    const elapsed = Date.now() - attempt.firstAttempt;
    return Math.max(0, windowMs - elapsed);
  }
}

export const rateLimiter = new RateLimiter();

// XSS Protection utility
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const entityMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entityMap[match] || match;
    })
    .trim();
};

// CSRF Protection utility
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Validate origin for API requests
export const validateOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    'https://lovableproject.com',
    'https://30ecae11-2ec4-4042-9cb5-3f6dd42f16c7.lovableproject.com',
    // Add production domains here
  ];
  
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }
  
  return allowedOrigins.includes(origin);
};