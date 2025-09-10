import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { createUrlWithUtm } = useUtmTracking();
  const { toast } = useToast();

  useEffect(() => {
    const processAuth = async () => {
      console.log('Processing OAuth callback...');
      console.log('Current URL:', window.location.href);
      console.log('URL params:', new URLSearchParams(window.location.search).toString());
      console.log('Hash params:', window.location.hash);
      
      // Check for error in URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (errorParam) {
        console.error('OAuth error from URL:', errorParam, errorDescription);
        // Log security events for monitoring  
        console.warn('[SECURITY] OAuth authentication failed:', {
          error: errorParam,
          description: errorDescription,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
        setError(`Authentication failed. Please try again.`);
        setLoading(false);
        return;
      }
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );
        
        // Get the current session from Supabase with timeout
        const sessionPromise = supabase.auth.getSession();
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (data.session && data.session.user) {
          console.log('[AUTH] User authenticated successfully');
          
          // Validate session integrity
          if (!data.session.access_token || !data.session.user.email) {
            throw new Error('Invalid session data received');
          }
          
          // Log successful authentication for monitoring
          console.log('[SECURITY] Authentication successful:', {
            userId: data.session.user.id,
            email: data.session.user.email,
            provider: data.session.user.app_metadata?.provider,
            timestamp: new Date().toISOString()
          });
          
          const userId = data.session.user.id;
          localStorage.setItem('userId', userId);
          
          // Check if this was a Google/Microsoft signup with pending parameters
          const pendingSignupParams = localStorage.getItem('pendingSignupParams');
          const isOAuthSignup = localStorage.getItem('isGoogleSignup');
          
          if (isOAuthSignup && pendingSignupParams) {
            try {
              // Process signup with stored parameters for OAuth auth
              const signupParams = JSON.parse(pendingSignupParams);
              const { data: signupData, error: signupError } = await supabase.functions.invoke('signup-process', {
                body: { 
                  email: data.session.user.email,
                  ...signupParams
                }
              });
              
              // Clean up stored parameters
              localStorage.removeItem('pendingSignupParams');
              localStorage.removeItem('isGoogleSignup');
              localStorage.setItem('userId', signupData.userId);
              console.log("signup-process completed for Google OAuth user:", signupData);

            } catch (signupError) {
              console.error('Error processing OAuth signup:', signupError);
            }
          }
          
          console.log('Redirecting to app...');
          const appUrl = createUrlWithUtm('/app');
          window.location.href = appUrl;
          return;
        }
        
        if (error) {
          console.error('Auth error:', error);
          setError(`Supabase Auth Error: ${error.message}`);
          setLoading(false);
          return;
        }
        
        // No session found, show error
        console.log('No session found');
        setError('No authentication session found. Please try signing in again.');
        setLoading(false);
        
        } catch (err) {
        console.error('[AUTH] Processing error:', err);
        
        // Log security events
        console.warn('[SECURITY] Authentication processing failed:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          retryCount,
          timestamp: new Date().toISOString()
        });

        // Implement retry logic for transient failures
        if (retryCount < 2 && (err instanceof Error && err.message.includes('timeout'))) {
          setRetryCount(prev => prev + 1);
          setTimeout(processAuth, 2000); // Retry after 2 seconds
          return;
        }

        setError('Authentication failed. Please try signing in again.');
        setLoading(false);
      }
    };
    
    // Process auth immediately
    processAuth();
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-lg font-semibold">Authentication Error</div>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;