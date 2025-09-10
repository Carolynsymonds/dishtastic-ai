import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, Video, Palette, Search, Bell, Settings, BarChart3, TrendingUp, Calendar, Image, Sparkles, Zap, Eye, Layout, CheckCircle2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import ProfitByMenuCategory from "@/components/ProfitByMenuCategory";
import { OnboardingModal } from "@/components/OnboardingModal";
import { siteContent } from "@/config/site-content";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Application = () => {
  const { user, session, loading } = useAuth();
  
  const [contentData] = useState([
    { id: 1, name: "Margherita Pizza", images: 24, videos: 8, engagement: "12.4K", status: "trending" },
    { id: 2, name: "Caesar Salad", images: 18, videos: 5, engagement: "8.7K", status: "popular" },
    { id: 3, name: "Beef Burger", images: 32, videos: 12, engagement: "15.2K", status: "viral" },
    { id: 4, name: "Pasta Carbonara", images: 16, videos: 6, engagement: "9.3K", status: "growing" },
    { id: 5, name: "Fish & Chips", images: 12, videos: 3, engagement: "5.1K", status: "new" }
  ]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session || !user) {
    console.log('[APP] No session found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // Only show onboarding for authenticated users
    if (session && user) {
      setShowOnboarding(true);
    }
  }, [session, user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowSuccessModal(true);
  };

  const handleRedirectToPreview = () => {
    window.location.href = '/';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "trending": return "bg-green-100 text-green-800";
      case "popular": return "bg-blue-100 text-blue-800";
      case "viral": return "bg-purple-100 text-purple-800";  
      case "growing": return "bg-orange-100 text-orange-800";
      case "new": return "bg-gray-100 text-gray-800";
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
              <h2 className="text-2xl font-bold text-foreground">Content Performance Overview</h2>
              <p className="text-sm text-muted-foreground">AI-generated food imagery and video performance insights</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard
                title="Images Generated"
                value="1,247"
                change="+23%"
                changeLabel="this month"
              />
              <MetricCard
                title="Videos Created"
                value="342"
                change="+18%"
                changeLabel="across all dishes"
              />
              <MetricCard
                title="Top Performer"
                value="Beef Burger"
                change="15.2K"
                changeLabel="engagement"
              />
              <MetricCard
                title="Brand Templates"
                value="127"
                change="+8"
                changeLabel="new templates added"
              />
            </div>
            
            {/* Content Performance Section */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dish Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Images: {item.images} | Videos: {item.videos}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{item.engagement}</p>
                            <p className="text-sm text-muted-foreground">Total Engagement</p>
                          </div>
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
              <p className="text-sm text-muted-foreground">You'll soon gain early access to our Beta program — and get a chance to shape the future of food imagery creation alongside us.</p>
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