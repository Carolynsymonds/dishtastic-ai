import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

interface SignUpFormProps {
  isLogin?: boolean;
}

const SignUpForm = ({ isLogin = false }: SignUpFormProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(isLogin ? 'login' : 'signup');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();
  const { getStoredUtmParams, createUrlWithUtm } = useUtmTracking();


  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 10,
    hasNumber: /\d/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);


  // Handle signup process with UTM parameters
  const handleSignupProcess = async (email: string) => {
    try {
      // Get stored UTM parameters
      const utmParams = getStoredUtmParams();
      console.log('SignUpForm - Retrieved UTM params during signup:', utmParams);
      const signupParams = {
        utmParams,
        referrerUrl: document.referrer || null,
        landingPagePath: siteContent.brand.name,
        leadId: localStorage.getItem('leadId'),
      };
      console.log('SignUpForm - Complete signup params being sent:', signupParams);

      // Call signup process function with all parameters
      const { data, error: signupError } = await supabase.functions.invoke('signup-process', {
        body: { 
          email,
          ...signupParams
        }
      });
      
      if (signupError) {
        console.error('signup-process failed', signupError);
        throw new Error('Signup process failed');
      }

      console.log("signup process completed", data);
      
      const userId = data?.userId;
      
      if (!userId) {
        console.error('signup-process returned no userId', data);
        throw new Error('No user ID returned');
      }
      localStorage.setItem('userId', userId);
      return data;
    } catch (error) {
      console.error('Error in signup process:', error);
      throw error;
    }
  };

  const handleEmailContinue = async () => {
    if (isValidEmail(email)) {
      setIsCreatingAccount(true);
      try {
        // Handle complete signup process with UTM parameters, lead creation, and account creation
        await handleSignupProcess(email);
        
        // Redirect directly to app with email parameter (preserving UTM)
        const appUrl = createUrlWithUtm('/app', { email });
        window.location.href = appUrl;
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingAccount(false);
      }
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setShowForgotPassword(false);
    try {
      // Attempt login directly
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // For security, Supabase returns the same error for both "email not found" and "wrong password"
        // Show generic error and forgot password option
        setShowForgotPassword(true);
        toast({
          title: "Error",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        const appUrl = createUrlWithUtm('/app', { email });
        window.location.href = appUrl;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCreateAccount = async () => {
    if (isPasswordValid) {
      setIsCreatingAccount(true);
      try {
        // Handle signup process with UTM parameters and lead creation
        await handleSignupProcess(email);
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Redirect directly to app without email verification (preserving UTM)
          const appUrl = createUrlWithUtm('/app', { email });
          window.location.href = appUrl;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingAccount(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Store signup parameters before OAuth flow
      const utmParams = getStoredUtmParams();
      const signupParams = {
        utmParams,
        referrerUrl: document.referrer || null,
        landingPagePath: siteContent.brand.name,
        leadId: localStorage.getItem('leadId'),
      };
      
      // Store parameters for use after OAuth callback
      localStorage.setItem('pendingSignupParams', JSON.stringify(signupParams));
      localStorage.setItem('isGoogleSignup', 'true');

      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
        
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMicrosoftSignUp = async () => {
    try {
      // Store signup parameters before OAuth flow (same as Google)
      const utmParams = getStoredUtmParams();
      const signupParams = {
        utmParams,
        referrerUrl: document.referrer || null,
        landingPagePath: siteContent.brand.name,
        leadId: localStorage.getItem('leadId'),
      };

      // Store parameters for use after OAuth callback
      localStorage.setItem('pendingSignupParams', JSON.stringify(signupParams));
      localStorage.setItem('isGoogleSignup', 'true'); // Reuse same flag for Microsoft
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid profile email offline_access https://graph.microsoft.com/User.Read'
        }
      });

      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderValidationIcon = (isValid: boolean) => (
    isValid ? (
      <Check className="w-3 h-3 text-green-600" />
    ) : (
      <span>•</span>
    )
  );

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'login') {
        if (isValidEmail(email) && password && !isLoggingIn) {
          handleLogin();
        }
      } else if (mode === 'signup') {
        if (step === 1 && isValidEmail(email) && !isCreatingAccount) {
          handleEmailContinue();
        } else if (step === 2 && isPasswordValid && !isCreatingAccount) {
          handleCreateAccount();
        }
      }
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Rocket Image */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/f37ec620-3f96-4f90-809e-0fd1daa4a175.png" 
              alt="Rocket Launch"
              className="w-32 h-32"
            />
          </div>
          
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground max-w-[350px] mx-auto leading-[2.8rem] mb-[43px]">
              Thanks for joining the {siteContent.brand.name} waitlist!
            </h1>
            <p className="text-xl text-muted-foreground max-w-[501px] mx-auto text-[15px]">
              We’ve saved a spot for you! You’ll get access to our Beta program soon and help shape the future of kitchen management. Keep an eye out — more information is on the way!</p>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              We respect your inbox — no spam, just exciting updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center">
              <img 
                src={siteContent.brand.logoUrl} 
                alt={`${siteContent.brand.name} Logo`} 
                className="h-[10rem] w-auto"
              />
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-foreground !mt-0">
            {isLogin ? 'Welcome back' : 'Start Your Free Trial Today'}
          </h1>
          {!isLogin && (
            <p className=" text-muted-foreground flex items-center justify-center gap-1">
              No credit card required. Takes 2 minutes.
            </p>
          )}
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 justify-center gap-3 text-normal border-[#bdc4be]"
            type="button"
            onClick={handleGoogleSignUp}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {"Continue with Google"}
          </Button>


          <Button
            variant="outline"
            className="w-full h-12 justify-center gap-3 text-normal border-[#bdc4be]"
            type="button"
            onClick={handleMicrosoftSignUp}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            {"Continue with Microsoft"}
          </Button>

        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Login Flow: Show both email and password together */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-12 border-[#bdc4be]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 border-[#bdc4be]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <Button 
              className="w-full h-12" 
              disabled={!isValidEmail(email) || !password || isLoggingIn}
              onClick={handleLogin}
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>

            {showForgotPassword && (
              <Button 
                variant="outline"
                className="w-full h-12" 
                disabled={isResettingPassword}
                onClick={handleForgotPassword}
              >
                {isResettingPassword ? "Sending reset email..." : "Forgot Password?"}
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Signup Flow: Email first (Step 1) */}
        {mode === 'signup' && step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-12 border-[#bdc4be]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <Button 
              className="w-full h-12" 
              disabled={!isValidEmail(email) || isCreatingAccount}
              onClick={handleEmailContinue}
            >
              {isCreatingAccount ? "Creating account..." : "Continue"}
            </Button>
          </div>
        )}

        {/* Signup Flow: Password Creation (Step 2) */}
        {mode === 'signup' && step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Create a new password"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Password Requirements */}
            <div className="grid grid-cols-1 gap-2" style={{ fontSize: '12px', color: '#000000b3' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.minLength)}
                  <span style={{ color: passwordValidation.minLength ? undefined : '#000000b3' }}>
                    Minimum of 10 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasNumber)}
                  <span style={{ color: passwordValidation.hasNumber ? undefined : '#000000b3' }}>
                    At least 1 number
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasLowercase)}
                  <span style={{ color: passwordValidation.hasLowercase ? undefined : '#000000b3' }}>
                    At least 1 lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasUppercase)}
                  <span style={{ color: passwordValidation.hasUppercase ? undefined : '#000000b3' }}>
                    At least 1 uppercase letter
                  </span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12" 
              disabled={!isPasswordValid || isCreatingAccount}
              onClick={handleCreateAccount}
            >
              {isCreatingAccount ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-3">
            <Check size={16} className="text-primary" />
            No credit card required
          </p>
        </div>
       
      </div>
    </div>
  );
};

export default SignUpForm;