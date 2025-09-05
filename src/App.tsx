import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Application from "./pages/Application";
import PurchasesBySupplier from "./pages/PurchasesBySupplier";
import Inventory from "./pages/Inventory";
import InventoryAnalytics from "./pages/InventoryAnalytics";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import { useUtmTracking } from "./hooks/useUtmTracking";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";
import TopBanner from "./components/TopBanner";

const queryClient = new QueryClient();

const UtmTracker = () => {
  useUtmTracking(); // Initialize UTM tracking
  useGoogleAnalytics(); // Initialize Google Analytics
  return null;
};

const ConditionalTopBanner = () => {
  const location = useLocation();
  const hideBannerRoutes = ['/signup', '/app'];
  const shouldHideBanner = hideBannerRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith('/app/')
  );
  
  return shouldHideBanner ? null : <TopBanner />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div>
          <ConditionalTopBanner />
          <UtmTracker />
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/free-plan" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<Application />} />
          <Route path="/app/purchases" element={<PurchasesBySupplier />} />
          <Route path="/app/inventory" element={<Inventory />} />
          <Route path="/app/inventory/analytics" element={<InventoryAnalytics />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
