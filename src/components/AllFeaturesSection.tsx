import { Sparkles, CheckCircle, Clock, Gift, Settings, Users, BookOpen, Briefcase, FileCheck, ArrowRight, FileText, Receipt, Utensils, Package, Calculator, ShoppingCart, DollarSign, Wifi } from "lucide-react";
import HeroBanner from "./HeroBanner";
import { siteContent } from "@/config/site-content";

const AllFeaturesSection = () => {
  return (
    <div className="bg-muted/10 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-5xl font-bold mb-4 tracking-tight text-foreground">{siteContent.allFeatures.title}</h2>
              <p className="text-xl text-muted-foreground font-normal">
                {siteContent.allFeatures.subtitle}
              </p>
            </div>
            
            <div className="hidden md:unset flex items-center gap-2 text-primary hover:text-primary/80 transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <a href="/features">
                <span className="text-sm font-medium">{siteContent.allFeatures.ctaText}</span>
              </a>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Build Section */}
        <div className="mb-16">
          <h3 className="text-lg font-semibold mb-6 text-foreground">{siteContent.allFeatures.operationalManagement.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteContent.allFeatures.operationalManagement.features.map((feature, index) => {
              const iconMap: { [key: string]: any } = {
                'settings': Settings,
                'users': Users,
                'check-circle': CheckCircle,
                'book-open': BookOpen,
                'briefcase': Briefcase,
                'file-check': FileCheck,
                'file-text': FileText,
                'receipt': Receipt,
                'utensils': Utensils,
                'package': Package,
                'calculator': Calculator,
                'shopping-cart': ShoppingCart,
                'dollar-sign': DollarSign,
                'wifi': Wifi
              };
              const IconComponent = iconMap[feature.icon] || Settings;
              
              return (
                <div key={index} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      {feature.isNew && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">New</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manage Section */}
        <div className="py-20">
          <h3 className="text-lg font-semibold mb-6 text-foreground">{siteContent.allFeatures.financialTools.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteContent.allFeatures.financialTools.features.map((feature, index) => {
              const iconMap: { [key: string]: any } = {
                'check-circle': CheckCircle,
                'clock': Clock,
                'gift': Gift,
                'settings': Settings,
                'wifi': Wifi
              };
              const IconComponent = iconMap[feature.icon] || CheckCircle;
              
              return (
                <div key={index} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      {feature.isNew && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">New</span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        <HeroBanner />
      </div>
    </div>
  );
};

export default AllFeaturesSection;