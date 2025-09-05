import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Package, Plus, Search, Bell, Settings, BarChart3, TrendingUp, Calendar, DollarSign, Warehouse, ChefHat, Trash2, Calculator, ClipboardList, CheckCircle2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import ProfitByMenuCategory from "@/components/ProfitByMenuCategory";
import { OnboardingModal } from "@/components/OnboardingModal";
import { supabase } from "@/integrations/supabase/client";
import { siteContent } from "@/config/site-content";

const Application = () => {
  
  const [menuData] = useState([
    { id: 1, name: "Margherita Pizza", cost: "$8.50", profit: "$6.50", margin: "43%", status: "profitable" },
    { id: 2, name: "Caesar Salad", cost: "$4.20", profit: "$7.80", margin: "65%", status: "excellent" },
    { id: 3, name: "Beef Burger", cost: "$12.30", profit: "$2.70", margin: "18%", status: "low-margin" },
    { id: 4, name: "Pasta Carbonara", cost: "$6.80", profit: "$8.20", margin: "55%", status: "profitable" },
    { id: 5, name: "Fish & Chips", cost: "$14.50", profit: "$0.50", margin: "3%", status: "critical" }
  ]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

 useEffect(() => {
    const checkUserAccess = () => {
      // Get user ID from local storage
      
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.log('No user ID found in localStorage, redirecting to home');
        window.location.href = '/login';
        return;
      }

      // Show onboarding modal by default
      setShowOnboarding(true);
    };

    checkUserAccess();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSuccessModal(true);
  };

  const handleRedirectToPreview = () => {
    window.location.href = '/';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "profitable": return "bg-green-100 text-green-800";
      case "excellent": return "bg-blue-100 text-blue-800";
      case "low-margin": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-white border-l border-border">
          <DashboardHeader />
          <div className="p-6">
            {/* Today's Snapshot */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Menu Performance Overview</h2>
              <p className="text-sm text-muted-foreground">Real-time cost analysis and profit margins</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard 
                title="Total Menu Items" 
                value="47" 
                change="+2.3%" 
              />
              <MetricCard 
                title="Average Food Cost" 
                value="$9.26" 
                change="-1.8%" 
              />
              <MetricCard 
                title="Average Profit Margin" 
                value="38%" 
                change="+3.2%" 
              />
              <MetricCard 
                title="Low Margin Items" 
                value="8" 
                change="-2.1%" 
              />
            </div>
            
            {/* Profit by Menu Category */}
            <div className="mb-6">
              <ProfitByMenuCategory />
            </div>
          
          </div>
        </main>
      </div>
      
      <OnboardingModal 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      {/* Success Modal for completed onboarding */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg" hideClose={true}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/5b64c1c1-e8c8-46a3-9e33-4e45b6bdd701.png" 
                alt="Success Checkmark"
                className="w-32 h-32"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">Your {siteContent.brand.name} dashboard is on its way.</p>
              <p className="text-sm text-muted-foreground">You'll soon gain early access to our Beta program — and get a chance to shape the future of menu costing alongside us.</p>
              <p className="text-sm text-muted-foreground">Stay tuned — exciting updates are coming your way.</p>
            </div>
            <Button onClick={handleRedirectToPreview} className="w-full">
             Continue learning about what's next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Application;