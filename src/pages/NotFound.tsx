import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { siteContent } from "@/config/site-content";
import { Button } from "@/components/ui/button";
import { Home, ChefHat } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Brand Logo */}
        <div className="mb-8">
          <img 
            src={siteContent.brand.logoUrl} 
            alt={siteContent.brand.name}
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ChefHat className="h-5 w-5" />
            <span className="text-sm font-medium">{siteContent.brand.name}</span>
          </div>
        </div>

        {/* 404 Content */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Call to Action */}
        <div className="space-y-3">
          <Button 
            asChild 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <a href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </a>
          </Button>
          <Button 
            variant="outline" 
            asChild 
            className="w-full"
          >
            <a href="/features">
              Explore Features
            </a>
          </Button>
        </div>

        {/* Support Text */}
        <p className="text-xs text-muted-foreground mt-6">
          Need help? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
