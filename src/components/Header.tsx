import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isSignupPage = location.pathname === '/signup';
  const { navigateWithUtm } = useUtmTracking();
  
  const handleSignupClick = () => {
    try {
      // GA4 recommended event
       window.gtag?.('event', 'sign_up', {
        method: 'cta_button',
        button_id: 'signup-btn',
        button_text: 'Start Free Trial',
        page_location: window.location.href,
      });
    } catch (e) {
      // no-op if gtag not available
    }

    // then navigate (SPA)
    navigateWithUtm('/signup');
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-md shadow-sm border-b border-gray-800' 
          : 'bg-black'
      }`}
    >
      <div className="mx-auto px-3 md:px-6 lg:px-6">
        <div className="flex items-center h-16 justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
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
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-4">
            {/* Desktop Buttons - Side by side */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleSignupClick}
                className="px-6 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Try for free
              </Button>
              
              <Button 
                onClick={() => navigateWithUtm('/login')}
                variant="ghost"
                className="px-6 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
              >
                Log in
              </Button>
            </div>

            {/* Mobile - Try for free button next to hamburger */}
            <Button 
              onClick={handleSignupClick}
              className="md:hidden px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Try for free
            </Button>
            
            {/* Mobile Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-background [&>button:last-child]:hidden">
                <div className="flex flex-col h-full">
                  {/* Header with logo, Try for free button, and close button */}
                  <div className="flex items-center justify-between p-2">
                    {/* Footer logo on the left */}
                    <Link to="/" className="flex items-center">
                      <img 
                        src={siteContent.brand.footerLogoUrl} 
                        alt={`${siteContent.brand.name} Logo`} 
                        className="w-12 h-12"
                      />
                    </Link>
                    
                    {/* Try for free button and close button on the right */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleSignupClick}
                        className="px-4 py-1.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                      >
                        Try for free
                      </Button>
                      
                      <SheetClose asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="flex flex-col gap-3 pt-4 pl-2 pr-2">
                    <Button 
                      onClick={() => navigateWithUtm('/explore/images')}
                      variant="ghost" 
                      className="w-full justify-start text-foreground font-sans text-lg py-2 px-0 pl-0"
                    >
                      Images
                    </Button>
                    
                    <Button 
                      onClick={() => navigateWithUtm('/explore/videos')}
                      variant="ghost" 
                      className="w-full justify-start text-foreground font-sans text-lg py-2 px-0 pl-0"
                    >
                      Videos
                    </Button>
                    
                    <div className="border-t pt-3">
                      <Button 
                        onClick={() => navigateWithUtm('/login')}
                        variant="ghost"
                        className="w-full justify-start text-foreground text-lg py-2 px-0 pl-0"
                      >
                        Log in
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;