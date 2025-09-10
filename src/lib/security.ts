// Security utilities for client-side protection

export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://jsjklbekqyhzqbabizve.supabase.co https://www.google-analytics.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s+/g, ' ').trim();

// Client-side security monitoring
export const logSecurityEvent = (event: string, details: Record<string, any>) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  console.warn('[SECURITY]', securityLog);
  
  // In production, you could send this to a monitoring service
  // fetch('/api/security-log', { method: 'POST', body: JSON.stringify(securityLog) });
};

// Detect potential security threats
export const detectSuspiciousActivity = () => {
  // Detect if running in suspicious environment
  if (typeof window !== 'undefined') {
    // Check for common attack tools
    const suspiciousGlobals = ['webdriver', '_phantom', '__nightmare'];
    const hasSuspiciousGlobals = suspiciousGlobals.some(global => global in window);
    
    if (hasSuspiciousGlobals) {
      logSecurityEvent('suspicious_environment', { globals: suspiciousGlobals });
    }
    
    // Monitor for unusual navigation patterns
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      const suspiciousReferrers = ['malware', 'phishing', 'spam'];
      if (suspiciousReferrers.some(term => document.referrer.toLowerCase().includes(term))) {
        logSecurityEvent('suspicious_referrer', { referrer: document.referrer });
      }
    }
  }
};

// Input sanitization for XSS prevention
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Secure local storage wrapper
export const secureStorage = {
  setItem: (key: string, value: string, ttl?: number) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // 24 hours default
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logSecurityEvent('storage_error', { key, error: (error as Error).message });
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      const now = Date.now();
      
      if (now - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      logSecurityEvent('storage_read_error', { key, error: (error as Error).message });
      return null;
    }
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};

// Initialize security monitoring
export const initSecurity = () => {
  if (typeof window !== 'undefined') {
    try {
      detectSuspiciousActivity();
      
      // Monitor for console manipulation attempts (only initialize once)
      if (!(window as any).__securityInitialized) {
        const originalLog = console.log;
        console.log = function(...args) {
          if (args.some(arg => typeof arg === 'string' && arg.includes('password'))) {
            logSecurityEvent('console_password_exposure', { args: args.map(String) });
          }
          originalLog.apply(console, args);
        };
        (window as any).__securityInitialized = true;
      }
    } catch (error) {
      console.error('Security initialization error:', error);
    }
  }
};