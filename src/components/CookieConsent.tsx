import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience and analyze site usage. By continuing to use our website, you consent to our use of cookies.{" "}
              <a 
                href="/privacy-policy" 
                className="text-primary hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReject}
              className="text-sm"
            >
              Reject
            </Button>
            <Button 
              size="sm" 
              onClick={handleAccept}
              className="text-sm"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;