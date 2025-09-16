import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X, Image, Video } from "lucide-react";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const ExploreHeader = () => {
  const { navigateWithUtm } = useUtmTracking();

  const handleLoginClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'login', {
        method: 'home_explore_page',
        button_id: 'login-btn',
        button_text: 'Log in',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // Navigate to login page
    navigateWithUtm('/login');
  };

  const handleSignupClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'sign_up', {
        method: 'home_explore_page',
        button_id: 'signup-btn',
        button_text: 'Try for free',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // Navigate to signup page
    navigateWithUtm('/signup');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      <div className="mx-auto px-3 md:px-6 lg:px-6">
        <div className="flex items-center h-16 justify-between">
          {/* Left-aligned brand identity */}
          <Link to="/" className="flex items-center">
            <img 
              src={siteContent.brand.logoUrl}  
              alt={`${siteContent.brand.name} Logo`} 
              className="h-12 w-auto mr-3"
            />
          </Link>
          {/* Navigation Menu */}
          <nav className="hidden md:flex gap-6">
            {/* Solution Link */}
             <Button 
               onClick={() => navigateWithUtm('/explore/images')}
               variant="ghost" 
               className="text-white font-normal hover:bg-transparent"
             >
               Images
             </Button>

            {/* Pricing Link */}
            <Button 
              onClick={() => navigateWithUtm('/explore/videos')}
              variant="ghost" 
              className="text-white font-normal hover:bg-transparent"
            >
              Videos
            </Button>
          </nav>
          
          {/* Right-aligned buttons */}
          <div className="flex items-center gap-4">
            {/* Desktop - Show both buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button 
                onClick={handleSignupClick}
                className="px-6 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Try for free
              </Button>
              <Button 
                onClick={handleLoginClick}
                variant="ghost"
                className="px-6 py-2 text-sm font-medium text-white transition-colors"
              >
                Log in
              </Button>
            </div>

            {/* Mobile - Show Try for free button and hamburger menu */}
            <div className="md:hidden flex items-center gap-2">
              <Button 
                onClick={handleSignupClick}
                className="px-4 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Try for free
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:text-gray-300"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full bg-black border-gray-800 [&>button:last-child]:hidden">
                  <div className="flex flex-col h-full">
                    {/* Header with logo and close button */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <Link to="/" className="flex items-center">
                        <img 
                          src={siteContent.brand.logoUrl} 
                          alt={`${siteContent.brand.name} Logo`} 
                          className="h-8 w-auto"
                        />
                      </Link>
                      
                      <SheetClose asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-white hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2 pt-6 px-4">
                      <Button 
                        onClick={() => {
                          navigateWithUtm('/explore/images');
                          // Close sheet after navigation
                          const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                          if (closeButton) closeButton.click();
                        }}
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-gray-800 hover:text-white font-medium text-lg py-4 px-4"
                      >
                        <Image className="h-5 w-5 mr-3" />
                        Images
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          navigateWithUtm('/explore/videos');
                          // Close sheet after navigation
                          const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                          if (closeButton) closeButton.click();
                        }}
                        variant="ghost" 
                        className="w-full justify-start text-white hover:bg-gray-800 hover:text-white font-medium text-lg py-4 px-4"
                      >
                        <Video className="h-5 w-5 mr-3" />
                        Videos
                      </Button>
                    </div>

                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExploreHeader;
