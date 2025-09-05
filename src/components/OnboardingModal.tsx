import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, ArrowLeft, DollarSign, Users, Calendar, TrendingUp, Trash2, Megaphone, Loader2, Utensils, Coffee, Zap, Cake, Truck, UtensilsCrossed, Store, Pizza } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { siteContent } from "@/config/site-content";
interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  onboardingData?: any; // Optional onboarding data from signup process
}
interface FormData {
  businessType: string;
  specialty: string;
  firstName: string;
  challenges: string[];
  selectedTools: string[];
  password: string;
  confirmPassword: string;
}
const OnboardingModal = ({
  open,
  onComplete,
  onboardingData
}: OnboardingModalProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessType: "",
    specialty: "",
    firstName: "",
    challenges: [],
    selectedTools: [],
    password: "",
    confirmPassword: ""
  });

  // Handle OAuth callback and check authentication status
  useEffect(() => {
    console.log('OnboardingModal mounted, checking for OAuth callback...');

    // Check if this is an email signup (not Google)
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');

    // If there's an email in URL, it's an email signup
    if (emailParam) {
      console.log('Detected email signup (not Google):', emailParam);
      setIsGoogleUser(false);
      // Load onboarding data for email signup
      loadOnboardingData(emailParam);
    }

    // Listen for auth changes - this handles Google OAuth callbacks
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change in onboarding:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session && session.user?.email) {
        console.log('User signed in via OAuth!, email:', session.user.email);

        // Check if this was a Google signup
        const isGoogleSignup = localStorage.getItem('isGoogleSignup');
        const pendingSignupParams = localStorage.getItem('pendingSignupParams');
        console.log(session.user.app_metadata?.provider);

        // Set OAuth user flag if this is Google/Microsoft user
        if (session.user.app_metadata?.provider === 'google' || session.user.app_metadata?.provider === 'azure' || isGoogleSignup === 'true') {
          setIsGoogleUser(true);
        }
        if (isGoogleSignup === 'true' && pendingSignupParams) {
          console.log('Processing Google signup with stored parameters');
          try {
            // Parse stored parameters
            const signupParams = JSON.parse(pendingSignupParams);
            console.log('Parsed signup params:', signupParams);

            // Call signup process function with stored parameters
            console.log('Calling signup-process function...');
            const {
              data: signupData,
              error: signupError
            } = await supabase.functions.invoke('signup-process', {
              body: {
                email: session.user.email,
                ...signupParams
              }
            });
            if (signupError) {
              console.error('signup-process failed for Google OAuth user:', signupError);
            } else {
              console.log("signup-process completed for Google OAuth user:", signupData);
              if (signupData?.userId) {
                localStorage.setItem('userId', signupData.userId);
                console.log('Stored userId:', signupData.userId);

                // Load onboarding data if available
                if (signupData.onboardingData) {
                  const {
                    progress,
                    draft
                  } = signupData.onboardingData;
                  if (draft) {
                    setFormData(prev => ({
                      ...prev,
                      firstName: draft.first_name || '',
                      businessType: draft.business_type || '',
                      specialty: draft.speciality || '',
                      challenges: draft.challenges || [],
                      selectedTools: Array.isArray(draft.smart_picks) ? draft.smart_picks : Object.keys(draft.smart_picks || {})
                    }));
                    console.log('Loaded onboarding data from Google signup response');
                  }
                  if (progress?.current_step) {
            setCurrentStep(progress.current_step);
            console.log('Set current step to:', progress.current_step);
          }

                  // Only show success if user has completed ALL steps, not just if they have smart_picks
                  // Completed means having smart_picks and being on final step (now step 5)
                  if (draft.smart_picks && progress?.current_step >= 5) {
                    console.log("User has completed onboarding, showing success");
                    onComplete();
                  }
                }
              }
            }

            // Clean up stored parameters
            localStorage.removeItem('isGoogleSignup');
            localStorage.removeItem('pendingSignupParams');
            console.log('Cleaned up stored parameters');
          } catch (signupError) {
            console.error('Error processing Google signup:', signupError);
          }
        }
      }
    });
    const checkAuthAndLoadData = async () => {
      // Use the userId from onboarding data instead of auth.getUser()
      const userId = onboardingData?.onboardingData?.userId;
      if (userId) {
        localStorage.setItem('userId', userId);

        // If onboardingData is provided from signup, use that instead of fetching
        if (onboardingData?.onboardingData) {
          const {
            progress,
            draft
          } = onboardingData.onboardingData;
          if (draft) {
            setFormData(prev => ({
              ...prev,
              firstName: draft.first_name || '',
              businessType: draft.business_type || '',
              specialty: draft.speciality || '',
              challenges: draft.challenges || [],
              selectedTools: Array.isArray(draft.smart_picks) ? draft.smart_picks : Object.keys(draft.smart_picks || {})
            }));
            console.log('Loaded onboarding data from signup response');
          }
          if (progress?.current_step) {
            setCurrentStep(progress.current_step);
          }
        } else {
          // If user is authenticated but no data provided, load from database
          await loadOnboardingData(user.email);
        }
      } else {
        // If no user, try to get email from URL params or other sources
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        if (emailParam) {
          await loadOnboardingData(emailParam);
        }
      }
    };
    checkAuthAndLoadData();
    return () => subscription.unsubscribe();
  }, [navigate, onboardingData]);
  const loadOnboardingData = async (email: string) => {
    if (!email) return;
    try {
      setIsEmailLoading(true);
      const userId = localStorage.getItem('userId');
      const {
        data,
        error
      } = await supabase.functions.invoke('get-lead-onboarding-data', {
        body: {
          userId
        }
      });
      if (error) {
        console.error('Error loading onboarding data:', error);
        return;
      }
      console.log('Loaded onboarding data:', data);

      // If user has completed onboarding, call onComplete to let Application handle success modal
      if (data.isCompleted) {
        onComplete();
        return;
      }

      // If there's existing onboarding data, populate the form
      if (data.onboardingData?.draftData) {
        const draft = data.onboardingData.draftData;
        setFormData(prev => ({
          ...prev,
          firstName: draft.first_name || "",
          businessType: draft.business_type || "",
          specialty: draft.speciality || "",
          challenges: draft.challenges || [],
          selectedTools: Array.isArray(draft.smart_picks) ? draft.smart_picks : Object.keys(draft.smart_picks || {})
        }));

        // Set current step from progress
        if (data.onboardingData.currentStep) {
          setCurrentStep(data.onboardingData.currentStep);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsEmailLoading(false);
    }
  };
  const businessTypes = ["Restaurant", "Café", "Fast Food", "Bakery", "Food Truck", "Catering", "Other"];
  const specialtyOptions = {
    "Restaurant": ["Italian cuisine", "Mexican food", "Asian fusion", "Steakhouse", "Seafood", "Mediterranean", "French cuisine", "Indian cuisine", "Thai food", "Sushi & Japanese", "American cuisine", "Farm-to-table"],
    "Café": ["Coffee & pastries", "Specialty coffee", "Brunch", "Light meals", "Artisan coffee", "Tea house", "Breakfast & lunch", "Organic café"],
    "Fast Food": ["Burgers & fries", "Pizza", "Sandwiches", "Fried chicken", "Tacos & burritos", "Hot dogs", "Quick serve Asian", "Healthy fast food"],
    "Bakery": ["Artisan breads", "Pastries & desserts", "Wedding cakes", "Cupcakes", "French pastries", "Sourdough", "Gluten-free baking", "Custom cakes"],
    "Food Truck": ["Gourmet burgers", "Street tacos", "BBQ", "Fusion cuisine", "Ice cream", "Sandwiches", "Ethnic street food", "Breakfast truck"],
    "Catering": ["Corporate catering", "Wedding catering", "Event catering", "Lunch delivery", "Party platters", "Holiday catering", "Specialty diets", "Buffet style"],
    "Other": ["Fine dining", "Food delivery", "Meal prep", "Ghost kitchen", "Pop-up restaurant", "Bar & grill", "Buffet", "Food hall"]
  };
  const challengeOptions = [{
    name: "Rising ingredient costs",
    icon: DollarSign
  }, {
    name: "Low customer traffic",
    icon: Users
  }, {
    name: "Staff shortages & schedules",
    icon: Calendar
  }, {
    name: "Menu profitability",
    icon: TrendingUp
  }, {
    name: "Food waste",
    icon: Trash2
  }, {
    name: "Lack of time for marketing",
    icon: Megaphone
  }];
  const productRecommendations = [{
    name: "MarketMan",
    benefit: "Reduce ingredient Costs",
    description: "MarketMan cut Taco del Mar's COGS by 3% through real-time inventory tracking and smarter supplier ordering."
  }, {
    name: "OpenTable",
    benefit: "Gain More Customers",
    description: "OpenTable helps restaurants gain up to 46% more reservations by tapping into its massive diner network and smart booking tools."
  }, {
    name: "7shifts",
    benefit: "Sort Staff Schedules",
    description: "7shifts boosts staff availability and saves 14 hours a month on average by letting teams manage schedules and swaps via mobile."
  }, {
    name: "Toast - Menu Upsell",
    benefit: "Grow Menu profitability",
    description: "Toast's AI-powered menu upsell drives a 6% boost in average order volume by intelligently recommending high-margin items at checkout."
  }, {
    name: "Toast - Food Waste Insights",
    benefit: "Save On Food waste",
    description: "Toast helps restaurants save $1,000s per month by using Dashboard Insights to track and reduce food waste with targeted actions."
  }, {
    name: "SpotHopper",
    benefit: "Run Quick & Effective Marketing",
    description: "SpotHopper drives $5K–$10K in extra monthly revenue per location by automating restaurant marketing in one platform."
  }];
  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleChallengeToggle = (challengeName: string) => {
    setFormData(prev => {
      const challenges = prev.challenges.includes(challengeName) ? prev.challenges.filter(c => c !== challengeName) : prev.challenges.length < 3 ? [...prev.challenges, challengeName] : prev.challenges;
      return {
        ...prev,
        challenges
      };
    });
  };
  const handleToolToggle = (toolName: string) => {
    setFormData(prev => {
      const selectedTools = prev.selectedTools.includes(toolName) ? prev.selectedTools.filter(t => t !== toolName) : [...prev.selectedTools, toolName];
      return {
        ...prev,
        selectedTools
      };
    });
  };
  const canProceedStep1 = formData.firstName;
  const canProceedStep2 = formData.businessType;
  const canProceedStep3 = formData.specialty.trim().length > 0;
  const canProceedStep4 = true; // No validation needed for challenges
  const canProceedStep5 = formData.selectedTools.length > 0; // At least 1 tool must be selected

  // Handle loading progress and success message
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoading(false);
            onComplete();
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  const handleComplete = async () => {
    const userId = localStorage.getItem('userId');
    setIsLoading(true);
    setProgress(0);
    try {
      // Complete signup with password (step 7)
      const {
        error: onboardingError
      } = await supabase.functions.invoke('signup-complete', {
        body: {
          userId: userId,
          password: formData.password
        }
      });
      if (onboardingError) {
        console.error('Signup completion error:', onboardingError);
        throw onboardingError;
      }

      // Update the user's password
      const {
        error: passwordError
      } = await supabase.auth.updateUser({
        password: formData.password
      });
      if (passwordError) {
        console.error('Password update error:', passwordError);
        throw passwordError;
      }

      // Continue with the loading animation
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  const handleContinue = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try signing up again.",
        variant: "destructive"
      });
      return;
    }
    setIsContinueLoading(true);
    let payload = {};
    switch (currentStep) {
      case 1:
        payload = {
          firstName: formData.firstName
        };
        break;
      case 2:
        payload = {
          businessType: formData.businessType
        };
        break;
      case 3:
        payload = {
          speciality: formData.specialty
        };
        break;
      case 4:
        payload = {
          challenges: formData.challenges
        };
        break;
      case 5:
        payload = {
          smartPicks: formData.selectedTools.reduce((acc, tool) => ({
            ...acc,
            [tool]: true
          }), {})
        };
        break;
    }
    try {
      if (currentStep <= 5) {
        const {
          error
        } = await supabase.functions.invoke('onboarding-update', {
          body: {
            userId: userId,
            step: currentStep,
            payload: payload
          }
        });
        if (error) {
          console.error(`Error saving step ${currentStep} data:`, error);
          toast({
            title: "Error",
            description: "Failed to save your information. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // For all users, complete signup after step 5 (no password step needed)
        if (currentStep === 5) {
          console.log('User completing signup after step 5 - no password step needed');

          // Call signup-complete without password - server generates one automatically
          const {
            error: completeError
          } = await supabase.functions.invoke('signup-complete', {
            body: {
              userId: userId
              // No password needed - server will generate one
            }
          });
          if (completeError) {
            console.error('Error completing signup:', completeError);
            toast({
              title: "Error",
              description: "Failed to complete signup. Please try again.",
              variant: "destructive"
            });
            return;
          }

          // Complete onboarding and show success modal in Application
          onComplete();
        } else {
          // For steps 1-4, move to the next step
          setCurrentStep(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
      toast({
        title: "Error",
        description: "Failed to process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsContinueLoading(false);
    }
  };

  // Welcome Screen
  const renderWelcome = () => <div className="flex flex-col items-center space-y-8 py-8">
      {/* Top Section - Success Icon */}
      <div className="animate-scale-in">
        <img src="/lovable-uploads/f37ec620-3f96-4f90-809e-0fd1daa4a175.png" alt="Rocket Launch" className="w-32 h-32" />
      </div>

      {/* Message Area - Middle Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Congratulations!
        </h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Thank you for joining MenuProfitMax. Start personalizing your experience today!
        </p>
      </div>

      {/* Action Button - Bottom Section */}
      <Button onClick={() => {
        setShowWelcome(false);
        setCurrentStep(1);
      }} className="flex items-center gap-2 py-[10px] px-[55px]">
        Continue
      </Button>
    </div>;

  // Step 1: Personal Information
  const renderStep1 = () => <div className="space-y-4">
      <div className="space-y-2">
        <Input 
          id="firstName" 
          value={formData.firstName} 
          onChange={e => handleInputChange("firstName", e.target.value)} 
          placeholder="Jane Doe" 
        />
      </div>
    </div>;

  // Step 2: Business Type
  const renderStep2 = () => <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {businessTypes.map(type => {
            const getBusinessIcon = (businessType: string) => {
              switch (businessType) {
                case "Restaurant": return Utensils;
                case "Café": return Coffee;
                case "Fast Food": return Pizza;
                case "Bakery": return Cake;
                case "Food Truck": return Truck;
                case "Catering": return UtensilsCrossed;
                case "Other": return Store;
                default: return Utensils;
              }
            };
            const IconComponent = getBusinessIcon(type);
            
            return (
              <Button
                key={type}
                variant={formData.businessType === type ? "default" : "outline"}
                onClick={() => handleInputChange("businessType", type)}
                className="flex flex-col items-center gap-1 h-auto p-3 text-xs"
              >
                <IconComponent className="w-5 h-5" />
                <span>{type}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>;

  // Step 3: Business Focus
  const renderStep3 = () => {
    const currentSpecialties = formData.businessType ? specialtyOptions[formData.businessType as keyof typeof specialtyOptions] || [] : [];
    const placeholderText = currentSpecialties.length > 0 ? `e.g., ${currentSpecialties.slice(0, 3).join(', ')}` : "Enter your specialty";
    return <div className="space-y-4">
        <div className="space-y-2">
          <Input id="specialty" value={formData.specialty} onChange={e => handleInputChange("specialty", e.target.value)} placeholder={placeholderText} className="lowercase" />
        </div>
      </div>;
  };

  // Step 4: Business Challenges
  const renderStep4 = () => <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {challengeOptions.map(challenge => {
        const Icon = challenge.icon;
        const isSelected = formData.challenges.includes(challenge.name);
        const isDisabled = !isSelected && formData.challenges.length >= 3;
        return <Button 
            key={challenge.name} 
            variant={isSelected ? "default" : "outline"} 
            className={`flex flex-col items-center gap-1 md:gap-2 h-auto p-2 md:p-4 text-xs transition-all hover:shadow-md hover:border-primary/30 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => !isDisabled && handleChallengeToggle(challenge.name)} 
            disabled={isDisabled}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="text-center leading-tight text-xs md:text-xs">{challenge.name}</span>
          </Button>;
      })}
      </div>
    </div>;

  // Step 5: Recommended Tools
  const renderStep5 = () => <div className="space-y-6">
      <div className="grid gap-4 min-h-[600px] overflow-y-auto">
        {productRecommendations.map((product, index) => <Card key={index} className={`border border-border cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${formData.selectedTools.includes(product.name) ? 'bg-primary/5 border-primary/50' : ''}`} onClick={() => handleToolToggle(product.name)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox checked={formData.selectedTools.includes(product.name)} className="flex-shrink-0 pointer-events-none" />
                <div className="flex-shrink-0 flex justify-center items-center">
                  {product.name === "MarketMan" && <img src="/lovable-uploads/26e791bd-7c02-4565-ba0a-dd5e6dc1dd01.png" alt="MarketMan logo" className="w-16 h-16 object-contain" />}
                  {product.name === "OpenTable" && <img src="/lovable-uploads/aba171dd-c0ba-47e8-8ac7-7c1b67cbc134.png" alt="OpenTable logo" className="w-16 h-16 object-contain" />}
                  {product.name === "7shifts" && <img src="/lovable-uploads/d8b46a21-b137-4f87-8227-f3ac55612d21.png" alt="7shifts logo" className="w-16 h-16 object-contain" />}
                  {(product.name === "Toast - Menu Upsell" || product.name === "Toast - Food Waste Insights") && <img src="/lovable-uploads/806ab93c-b103-4da0-869d-b2dfa9b1d916.png" alt="Toast logo" className="w-16 h-16 object-contain" />}
                  {product.name === "SpotHopper" && <img src="/lovable-uploads/f5df8e4d-3189-4a31-8f9e-899082910b78.png" alt="SpotHopper logo" className="w-16 h-16 object-contain" />}
                  {!["MarketMan", "OpenTable", "7shifts", "Toast - Menu Upsell", "Toast - Food Waste Insights", "SpotHopper"].includes(product.name) && <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">
                        {product.name.charAt(0)}
                      </span>
                    </div>}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-primary text-sm mb-1">{product.benefit}</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;

  // Step 7: Password Setup
  const renderStep7 = () => <div className="space-y-6">
    
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={formData.password} onChange={e => handleInputChange("password", e.target.value)} placeholder="Use letters, numbers & symbols" />
          {formData.password && formData.password.length < 6 && <p className="text-sm text-destructive">Password must be at least 6 characters</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => handleInputChange("confirmPassword", e.target.value)} placeholder="Make sure it matches" />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-sm text-destructive">Passwords do not match</p>}
        </div>
      </div>
    </div>;
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "What's your name?";
      case 2:
        return "What type of business do you run?";
      case 3:
        return "What do you serve or specialize in?";
      case 4:
        return "Your Business Challenges";
      case 5:
        return "Boost Your Restaurant's Profits with the Right Tools";
      case 6:
        return "Boost Your Restaurant’s Profits with the Right Tools";
      default:
        return "";
    }
  };
  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Tell us how we should greet you";
      case 2:
        return "Choose the category that best describes your business.";
      case 3:
        return "Tell us what makes your business unique.";
      case 4:
        return "Select up to 3 challenges";
      case 5:
        return `Pick partner apps to get in contact with you to cut costs, fill tables, and grow sales — all fully compatible with ${siteContent.brand.name}`;
      default:
        return "";
    }
  };

  // Loading screen
  if (isLoading) {
    return <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md border-none bg-transparent shadow-none" hideClose={true}>
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-6">
            <div className="w-full max-w-xs">
              <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-muted-foreground to-orange-500 rounded-full transition-all duration-100 ease-out" style={{
                width: `${progress}%`,
                boxShadow: `0 0 20px hsl(var(--orange-500) / 0.5), 0 0 40px hsl(var(--orange-500) / 0.3)`
              }} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Setting up your experience...</p>
          </div>
        </DialogContent>
      </Dialog>;
  }

  // Show welcome screen first
  if (showWelcome) {
    return <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="h-full sm:h-auto max-w-lg" hideClose={true}>
          <DialogHeader>
            <DialogTitle className="sr-only">Welcome</DialogTitle>
          </DialogHeader>
          <div className="py-4 px-1">
            {renderWelcome()}
          </div>
        </DialogContent>
      </Dialog>;
  }

  return <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="h-full sm:h-auto max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col" hideClose={true}>
        <DialogHeader>
          <div className="bg-muted/50 border border-muted rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-center text-muted-foreground">
              Personalize your {siteContent.brand.name} experience by answering a few questions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((step, index) => <div key={step} className={`h-2 flex-1 rounded-full ${step <= currentStep ? "bg-primary" : "bg-muted"}`} />)}
          </div>
          <div className="text-center pt-4 max-w-[450px] my-[10px] mx-auto">
            <h2 className="text-2xl font-bold font-grotesk">{getStepTitle()}</h2>
            {getStepSubtitle() && <p className="text-sm text-muted-foreground mt-1">
                {getStepSubtitle()}
              </p>}
          </div>
        </DialogHeader>

        <div className="py-4 px-1 overflow-y-auto flex-1">
          {isEmailLoading ? <div className="text-center py-8">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div> : <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
            </>}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {currentStep > 1 ? <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} className="flex items-center gap-2">
              Back
            </Button> : <div />}

          {currentStep <= 5 ? <Button onClick={handleContinue} disabled={isContinueLoading || currentStep === 1 && !canProceedStep1 || currentStep === 2 && !canProceedStep2 || currentStep === 3 && !canProceedStep3 || currentStep === 4 && !canProceedStep4 || currentStep === 5 && !canProceedStep5} className="flex items-center gap-2">
              {isContinueLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {currentStep === 5 ? "Create account" : "Continue"}
            </Button> : null}
        </div>
      </DialogContent>
    </Dialog>;
};
export { OnboardingModal };