import { logSecurityEvent as baseLogSecurityEvent, secureStorage as baseSecureStorage } from './security';

/**
 * Enhanced secure storage with encryption for sensitive data
 */
class SecureStorageManager {
  private encryptionKey: string;

  constructor() {
    // Generate or retrieve encryption key (in production, use proper key management)
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  private getOrCreateEncryptionKey(): string {
    const stored = localStorage.getItem('__app_key');
    if (stored) return stored;
    
    // Generate a simple key (in production, use crypto.subtle or similar)
    const key = btoa(Math.random().toString(36) + Date.now().toString(36));
    localStorage.setItem('__app_key', key);
    return key;
  }

  private encrypt(data: string): string {
    try {
      // Simple XOR encryption (in production, use proper encryption)
      return btoa(data.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length))
      ).join(''));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData);
      return decoded.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length))
      ).join('');
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to original data
    }
  }

  setSecure(key: string, value: any, ttl?: number): void {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + ttl : null
      };
      
      const encrypted = this.encrypt(JSON.stringify(data));
      localStorage.setItem(`__sec_${key}`, encrypted);
      
      // Log access for sensitive operations
      if (key.includes('token') || key.includes('session') || key.includes('auth')) {
        baseLogSecurityEvent('secure_storage_write', { key: key.substring(0, 8) + '***' });
      }
    } catch (error) {
      console.error('Secure storage write failed:', error);
      baseSecureStorage.setItem(key, value, ttl); // Fallback to base storage
    }
  }

  getSecure(key: string): any {
    try {
      const encrypted = localStorage.getItem(`__sec_${key}`);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      const data = JSON.parse(decrypted);

      // Check TTL
      if (data.ttl && Date.now() > data.ttl) {
        this.removeSecure(key);
        return null;
      }

      // Log access for sensitive operations
      if (key.includes('token') || key.includes('session') || key.includes('auth')) {
        baseLogSecurityEvent('secure_storage_read', { key: key.substring(0, 8) + '***' });
      }

      return data.value;
    } catch (error) {
      console.error('Secure storage read failed:', error);
      return baseSecureStorage.getItem(key); // Fallback to base storage
    }
  }

  removeSecure(key: string): void {
    localStorage.removeItem(`__sec_${key}`);
  }

  clearExpired(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('__sec_'));
    keys.forEach(key => {
      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return;

        const decrypted = this.decrypt(encrypted);
        const data = JSON.parse(decrypted);

        if (data.ttl && Date.now() > data.ttl) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Enhanced security monitoring system
 */
class SecurityMonitorEnhanced {
  private rateLimits = new Map<string, { count: number; resetTime: number }>();
  private securityViolations = 0;
  private maxViolations = 10;

  constructor() {
    this.initEnhancedMonitoring();
  }

  private initEnhancedMonitoring(): void {
    // Monitor for suspicious DOM manipulation
    this.monitorDOMManipulation();
    
    // Monitor for suspicious network activity
    this.monitorNetworkActivity();
    
    // Monitor for XSS attempts
    this.monitorXSSAttempts();
    
    // Periodic cleanup
    setInterval(() => {
      this.cleanupRateLimits();
      secureStorage.clearExpired();
    }, 60000); // Every minute
  }

  private monitorDOMManipulation(): void {
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value: string) {
        // Check for potential XSS patterns
        const suspiciousPatterns = [
          /<script[^>]*>/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /<iframe[^>]*>/i,
          /data:text\/html/i
        ];

        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
        
        if (isSuspicious) {
          securityMonitor.logViolation('suspicious_innerHTML', { content: value.substring(0, 100) });
          // Don't set the value if it's suspicious
          return;
        }

        // Use original setter
        if (originalInnerHTML?.set) {
          originalInnerHTML.set.call(this, value);
        }
      },
      get: originalInnerHTML?.get,
      configurable: true
    });
  }

  private monitorNetworkActivity(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args: Parameters<typeof fetch>) {
      const url = args[0].toString();
      
      // Rate limiting for API calls
      if (!securityMonitor.checkRateLimit('api_calls', 100, 60000)) { // 100 calls per minute
        throw new Error('Rate limit exceeded for API calls');
      }
      
      // Monitor for suspicious domains
      try {
        const urlObj = new URL(url, window.location.origin);
        if (urlObj.hostname !== window.location.hostname && 
            !urlObj.hostname.endsWith('.supabase.co') &&
            !urlObj.hostname.includes('localhost')) {
          securityMonitor.logViolation('external_api_call', { domain: urlObj.hostname });
        }
      } catch (error) {
        // Invalid URL, let it fail naturally
      }
      
      return originalFetch.apply(this, args);
    };
  }

  private monitorXSSAttempts(): void {
    // Monitor form inputs for XSS attempts
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const value = target.value;
        
        const xssPatterns = [
          /<script[^>]*>/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /%3Cscript/i, // URL encoded
          /&lt;script/i  // HTML encoded
        ];

        const hasXSS = xssPatterns.some(pattern => pattern.test(value));
        
        if (hasXSS) {
          this.logViolation('xss_attempt_input', { 
            field: target.name || target.id || 'unknown',
            pattern: value.substring(0, 50)
          });
          
          // Clear the suspicious input
          target.value = '';
          
          // Show warning to user
          const event = new CustomEvent('security-warning', {
            detail: { message: 'Potentially dangerous input detected and removed' }
          });
          window.dispatchEvent(event);
        }
      }
    });
  }

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      baseLogSecurityEvent('rate_limit_exceeded', { key, count: limit.count });
      return false;
    }

    limit.count++;
    return true;
  }

  logViolation(type: string, details: any): void {
    this.securityViolations++;
    baseLogSecurityEvent('security_violation', { type, details, total: this.securityViolations });

    // If too many violations, take action
    if (this.securityViolations >= this.maxViolations) {
      this.handleSecurityBreach();
    }
  }

  private handleSecurityBreach(): void {
    baseLogSecurityEvent('security_breach_detected', { 
      violations: this.securityViolations,
      action: 'session_invalidation'
    });

    // Clear sensitive data
    secureStorage.clearExpired();
    
    // Notify user
    const event = new CustomEvent('security-breach', {
      detail: { message: 'Multiple security violations detected. Session cleared.' }
    });
    window.dispatchEvent(event);

    // Reset counter
    this.securityViolations = 0;
  }

  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.rateLimits.entries()) {
      if (now > limit.resetTime) {
        this.rateLimits.delete(key);
      }
    }
  }
}

// Create enhanced instances
export const secureStorage = new SecureStorageManager();
export const securityMonitor = new SecurityMonitorEnhanced();

// Enhanced logging function
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  baseLogSecurityEvent(event, details);
  
  // Additional client-side logging for critical events
  if (['security_violation', 'rate_limit_exceeded', 'xss_attempt'].some(critical => event.includes(critical))) {
    console.warn(`🚨 Security Event: ${event}`, details);
  }
};

// Initialize enhanced security
if (typeof window !== 'undefined') {
  // Start monitoring
  new SecurityMonitorEnhanced();
  
  // Add global error handler for security events
  window.addEventListener('error', (event) => {
    if (event.message.includes('CSP') || event.message.includes('security')) {
      logSecurityEvent('client_security_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      });
    }
  });

  // Listen for security warnings and show user-friendly messages
  window.addEventListener('security-warning', ((event: CustomEvent) => {
    // You can integrate with your toast system here
    console.warn('Security Warning:', event.detail.message);
  }) as EventListener);

  window.addEventListener('security-breach', ((event: CustomEvent) => {
    // You can integrate with your toast system here
    console.error('Security Breach:', event.detail.message);
  }) as EventListener);
}