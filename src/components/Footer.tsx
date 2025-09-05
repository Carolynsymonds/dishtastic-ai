import { Link } from "react-router-dom";
import { siteContent } from "@/config/site-content";

interface FooterProps {
  variant?: "default" | "white";
}

const Footer = ({ variant = "default" }: FooterProps) => {
  const isWhite = variant === "white";
  
  return (
    <footer className={`py-16 rounded-[1.5rem] ${isWhite ? "bg-white" : "bg-background"}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src={siteContent.brand.footerLogoUrl} alt={`${siteContent.brand.name} Logo`} className="w-16 h-16" />
            </div>
            <p className="text-sm" style={{ color: '#0000008a' }}>
               © 2025 {siteContent.brand.name}, Inc.
            </p>
          </div>
          
          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <nav>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/" 
                    className="block text-footer-custom-text hover:text-footer-custom-text hover:underline hover:decoration-primary transition-colors duration-200"
                  >
                    <span className="InlineTextLink_linkContent__SYI4r">
                      <span className="typography_typography__Exx2D text-sm">
                        Home
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <Link 
                    to="/pricing"
                    className="block text-footer-custom-text hover:text-footer-custom-text hover:underline hover:decoration-primary transition-colors duration-200"
                  >
                    <span className="InlineTextLink_linkContent__SYI4r">
                      <span className="typography_typography__Exx2D text-sm">
                        Pricing
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact"
                    className="block text-footer-custom-text hover:text-footer-custom-text hover:underline hover:decoration-primary transition-colors duration-200"
                  >
                    <span className="InlineTextLink_linkContent__SYI4r">
                      <span className="typography_typography__Exx2D text-sm">
                        Contact Us
                      </span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Legal Column */}
          <div className="lg:col-span-2 space-y-4">
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/privacy-policy" 
                    className="block text-footer-custom-text hover:text-footer-custom-text hover:underline hover:decoration-primary transition-colors duration-200"
                  >
                    <span className="InlineTextLink_linkContent__SYI4r">
                      <span className="typography_typography__Exx2D text-sm">
                        Privacy Policy
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms-conditions" 
                    className="block text-footer-custom-text hover:text-footer-custom-text hover:underline hover:decoration-primary transition-colors duration-200"
                  >
                    <span className="InlineTextLink_linkContent__SYI4r">
                      <span className="typography_typography__Exx2D text-sm">
                        Terms & Conditions
                      </span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;