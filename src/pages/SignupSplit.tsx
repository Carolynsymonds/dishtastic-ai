import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Check, Quote, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import { siteContent } from "@/config/site-content";
import TrustedBy from "@/components/TrustedBy";

const SignupSplit = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
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

  const handleCreateAccount = async () => {
    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingAccount(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        setStep(3);
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const renderValidationIcon = (isValid: boolean) => (
    isValid ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    )
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        handleEmailContinue();
      } else if (step === 2) {
        handleCreateAccount();
      }
    }
  };

  return (
    <div className="min-h-svh md:min-h-screen flex flex-col md:flex-row justify-between md:justify-start">
      {/* Form Section - Top on mobile, Left on desktop */}
      <div className="flex-1 bg-white flex items-center flex-col justify-center p-4 md:p-8 md:min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-block">
              <img 
                src={siteContent.brand.logoUrl} 
                alt={siteContent.brand.name} 
                className="h-28 md:h-40 mx-auto md:mb-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to {siteContent.brand.name}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Boost Restaurant Profits with Smarter Menu Costing
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-8">
              <ShieldCheck size={16} className="text-gray-500" />
              Protected by enterprise grade security
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Business email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-gray-300 h-12"
                />
              </div>

              <Button
                onClick={handleEmailContinue}
                disabled={!email || isCreatingAccount}
                className="w-full rounded-lg shadow-sm h-12"
              >
                {isCreatingAccount ? "Creating account..." : "Continue for free"}
              </Button>


             
              
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.minLength)}
                  <span className={passwordValidation.minLength ? "text-green-600" : "text-gray-500"}>
                    At least 10 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasNumber)}
                  <span className={passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}>
                    Contains a number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasLowercase)}
                  <span className={passwordValidation.hasLowercase ? "text-green-600" : "text-gray-500"}>
                    Contains lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderValidationIcon(passwordValidation.hasUppercase)}
                  <span className={passwordValidation.hasUppercase ? "text-green-600" : "text-gray-500"}>
                    Contains uppercase letter
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={!isPasswordValid || isCreatingAccount}
                className="w-full rounded-lg shadow-sm"
              >
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold">Check Your Email!</h2>
              <p className="text-gray-600">
                We've sent a verification link to {email}. Please check your email and click the link to activate your account.
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-500 space-y-1">
             <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Check size={16} className="text-primary" />
              No credit card required
            </p>

          </div>
        </div>
        {/* Trusted by section - Mobile only */}
        <div className="mt-8 w-full">
          <TrustedBy />
        </div>
      </div>

      

      {/* Testimonial Section - Bottom on mobile, Right on desktop */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-sage-50 to-sage-100 items-center justify-center p-4 md:p-8 md:min-h-screen">
        <div className="max-w-lg space-y-6 md:space-y-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Testimonial */}
          <div className="space-y-4">
            <Quote className="w-8 h-8 text-primary" />
            <blockquote className="text-lg text-gray-800 leading-relaxed italic">
              "MenuProfitMax transformed how I understand my restaurant's profitability. 
              The real-time ingredient costing and profit margin analysis helped me increase 
              our bottom line by 23% in just three months."
            </blockquote>
            <div>
              <div className="font-semibold text-gray-900">Elinor B.</div>
              <div className="text-sm text-gray-500">Restaurant Owner</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-semibold">
              Trusted by Restaurateurs at
            </p>
            <div className="flex justify-around items-center gap-6 flex-wrap">
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/9efe8d5f-1e81-42b0-8803-d420694c0d6d.png" 
                  alt="Papa John's" 
                  className="h-6 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/ec3ab3f1-fac3-42f8-80b5-c88c5a6ca92f.png" 
                  alt="Chipotle Mexican Grill" 
                  className="h-12 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/2e57f3ae-6eeb-4f88-8a90-a459f7dc5c67.png" 
                  alt="Chick-fil-A" 
                  className="h-12 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/8881ee5b-e5b5-4950-a384-bf791c2cb69a.png" 
                  alt="Applebee's" 
                  className="h-14 max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSplit;