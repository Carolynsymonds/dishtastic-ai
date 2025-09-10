import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'verification_access' | 'auth_attempt' | 'data_access' | 'suspicious_activity';
  details: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 100;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      // Note: IP address would need to be obtained from a backend service
    };

    this.events.unshift(securityEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[SECURITY EVENT]', securityEvent);
    }

    // Send critical events to backend for monitoring
    if (this.isCriticalEvent(event.type)) {
      this.sendToMonitoring(securityEvent);
    }
  }

  private isCriticalEvent(type: SecurityEvent['type']): boolean {
    return ['suspicious_activity', 'auth_attempt'].includes(type);
  }

  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    try {
      // In a real implementation, this would send to a monitoring service
      // For now, we'll log it to Supabase analytics
      console.warn('[CRITICAL SECURITY EVENT]', {
        type: event.type,
        timestamp: event.timestamp,
        details: event.details
      });
    } catch (error) {
      console.error('Failed to send security event to monitoring:', error);
    }
  }

  getRecentEvents(type?: SecurityEvent['type']): SecurityEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type);
    }
    return [...this.events];
  }

  // Rate limiting functionality
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      this.logEvent({
        type: 'suspicious_activity',
        details: {
          reason: 'rate_limit_exceeded',
          key: key.substring(0, 10) + '***', // Partially obscure key
          attempts: record.count
        }
      });
      return false;
    }

    record.count++;
    return true;
  }

  // Verification access monitoring
  async monitorVerificationAccess(token: string, email?: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      // Check rate limiting
      const ipKey = `verification_${this.getClientFingerprint()}`;
      if (!this.checkRateLimit(ipKey, 10, 60000)) { // 10 attempts per minute
        return false;
      }

      // Query with the token
      const { data, error } = await supabase
        .from('dish_analysis_verifications')
        .select('email, expires_at, verified_at')
        .eq('verification_token', token)
        .single();

      const responseTime = performance.now() - startTime;

      if (error) {
        this.logEvent({
          type: 'verification_access',
          details: {
            success: false,
            error: error.message,
            responseTime,
            hasValidToken: !!token
          }
        });
        return false;
      }

      this.logEvent({
        type: 'verification_access',
        details: {
          success: true,
          responseTime,
          emailMatch: email ? data.email === email : null,
          isExpired: new Date(data.expires_at) < new Date(),
          isAlreadyVerified: !!data.verified_at
        }
      });

      return true;
    } catch (error) {
      this.logEvent({
        type: 'verification_access',
        details: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: performance.now() - startTime
        }
      });
      return false;
    }
  }

  // Generate a simple client fingerprint for rate limiting
  private getClientFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Cleanup old rate limit records
  cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

// Initialize cleanup interval
setInterval(() => {
  securityMonitor.cleanupRateLimits();
}, 60000); // Clean up every minute
