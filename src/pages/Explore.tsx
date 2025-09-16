import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { siteContent } from "@/config/site-content";
import { useUtmTracking } from "@/hooks/useUtmTracking";

const Explore = () => {
  const { navigateWithUtm } = useUtmTracking();

  const handleLoginClick = () => {
    try {
      // GA4 recommended event
      window.gtag?.('event', 'login', {
        method: 'explore_page',
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Black horizontal bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="container mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center h-16 justify-between">
            {/* Left-aligned brand identity */}
            <Link to="/" className="flex items-center">
              <img 
                src={siteContent.brand.logoUrl}  
                alt={`${siteContent.brand.name} Logo`} 
                className="h-12 w-auto mr-3"
              />
            
            </Link>
            
            {/* Right-aligned Log in button */}
            <Button 
              onClick={handleLoginClick}
              className="px-6 py-2 text-sm font-semibold bg-white hover:bg-gray-100 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Log in
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Three vertical panels */}
      <main className="pt-16">
        {/* Hero Section - Three panels */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Seafood Rolls */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop"
              alt="Lobster Roll - Seafood Rolls"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Ramen & Noodles */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="/lovable-uploads/3019963f-d795-4f70-a8a6-9e8a0f85c0ef.png"
              alt="Ramen Bowl - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Bowls & Salads */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1400&auto=format&fit=crop"
              alt="Poke Bowl - Bowls & Salads"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Additional Images Section */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - More Seafood */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop"
              alt="Shrimp Roll - Seafood Rolls"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - More Noodles */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="/lovable-uploads/9b776cf4-fad8-4955-a4a2-ccbbd1ce7a96.png"
              alt="Udon - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - More Bowls */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1400&auto=format&fit=crop"
              alt="Grain Bowl - Bowls & Salads"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Cupcakes */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1400&auto=format&fit=crop"
              alt="Cupcakes - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Tacos */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1400&auto=format&fit=crop"
              alt="Tacos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Wings */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1400&auto=format&fit=crop"
              alt="Wings - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Fourth Row */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Soba */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1400&auto=format&fit=crop"
              alt="Soba - Ramen & Noodles"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Avocado Salad */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1522184216315-dc2f3f3b9f98?q=80&w=1400&auto=format&fit=crop"
              alt="Avocado Salad - Bowls & Salads"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Additional Food */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1400&auto=format&fit=crop"
              alt="Lasagna - Additional Dishes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Fifth Row - Desserts & Bakes */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Cookies */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop"
              alt="Cookies - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Cheesecake */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1400&auto=format&fit=crop"
              alt="Cheesecake - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Brownie */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1540126034813-121bf29033c8?q=80&w=1400&auto=format&fit=crop"
              alt="Brownie - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Sixth Row - More Desserts & Tacos */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Cupcakes */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1400&auto=format&fit=crop"
              alt="Cupcakes - Desserts & Bakes"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Tacos */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=1400&auto=format&fit=crop"
              alt="Tacos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Wings */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1400&auto=format&fit=crop"
              alt="Wings - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Seventh Row - More Tacos & Wings */}
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left Panel - Nachos */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1541542684-4a1a72e1c8a3?q=80&w=1400&auto=format&fit=crop"
              alt="Nachos - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Panel - Quesadilla */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1400&auto=format&fit=crop"
              alt="Quesadilla - Tacos & Wings"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Panel - Additional Food */}
          <div className="flex-1 relative overflow-hidden w-[420px] h-[600px] mx-auto md:w-full md:h-full">
            <img 
              src="https://images.unsplash.com/photo-1516685018646-549198525c1b?q=80&w=1400&auto=format&fit=crop"
              alt="Lasagna - Additional Dishes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explore;
