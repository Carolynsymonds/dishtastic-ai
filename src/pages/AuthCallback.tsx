import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { createUrlWithUtm } = useUtmTracking();

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
        setError(`OAuth Error: ${errorParam} - ${errorDescription}`);
        setLoading(false);
        return;
      }
      
      try {
        // Get the current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session && data.session.user) {
          console.log('User authenticated, storing userId...');
          
          // Store userId in localStorage for OAuth auth
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
        console.error('Auth processing error:', err);
        setError(`Processing Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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