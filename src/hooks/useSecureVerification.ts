import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from '@/lib/security-monitor';
import { toast } from 'sonner';

interface VerificationData {
  email: string;
  dishes_data: any;
  verified_at: string | null;
  expires_at: string;
}

interface UseSecureVerificationResult {
  verification: VerificationData | null;
  loading: boolean;
  error: string | null;
  fetchVerification: (token: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

export const useSecureVerification = (): UseSecureVerificationResult => {
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async (token: string): Promise<boolean> => {
    if (!token || token.length < 10) {
      setError('Invalid verification token');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Use secure function for verification access with enhanced monitoring
      const { data, error: rpcError } = await supabase.rpc('get_verification_by_token', {
        p_token: token
      });

      if (rpcError) {
        if (rpcError.message?.includes('Rate limit exceeded')) {
          setError('Too many verification attempts. Please try again later.');
          toast.error('Rate limit exceeded. Please wait before trying again.');
        } else {
          setError('Verification not found or expired');
        }
        return false;
      }

      if (!data || data.length === 0) {
        setError('Verification not found or expired');
        return false;
      }

      const verification = data[0];

      // Additional client-side validation
      if (new Date(verification.expires_at) < new Date()) {
        setError('Verification link has expired');
        return false;
      }

      setVerification(verification);
      
      // Log successful access
      securityMonitor.logEvent({
        type: 'verification_access',
        details: {
          success: true,
          action: 'verification_loaded',
          secureFunction: true,
          hasData: !!verification.dishes_data
        }
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch verification';
      setError(errorMessage);
      securityMonitor.logEvent({
        type: 'verification_access',
        details: {
          success: false,
          error: errorMessage,
          tokenProvided: !!token,
          secureFunction: true
        }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    if (!verification) {
      setError('No verification data loaded');
      return false;
    }

    if (verification.verified_at) {
      setError('Email already verified');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Use secure validation function first
      const { data: isValid, error: validationError } = await supabase.rpc('validate_verification_access', {
        p_token: token,
        p_email: verification.email
      });

      if (validationError || !isValid) {
        setError('Verification validation failed');
        return false;
      }

      // Proceed with verification update
      const { error: updateError } = await supabase
        .from('dish_analysis_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('verification_token', token)
        .eq('verified_at', null); // Only update if not already verified

      if (updateError) {
        setError('Failed to verify email');
        return false;
      }

      // Update local state
      setVerification(prev => prev ? {
        ...prev,
        verified_at: new Date().toISOString()
      } : null);

      securityMonitor.logEvent({
        type: 'verification_access',
        details: {
          success: true,
          action: 'email_verified',
          email: verification.email.substring(0, 3) + '***',
          secureFunction: true
        }
      });

      toast.success('Email verified successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [verification]);

  return {
    verification,
    loading,
    error,
    fetchVerification,
    verifyEmail
  };
};