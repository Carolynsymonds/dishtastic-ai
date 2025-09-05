import { useEffect } from 'react';
import { siteContent } from '@/config/site-content';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAnalytics = () => {
  useEffect(() => {
    const measurementId = siteContent.analytics.googleAnalyticsId;
    
    if (!measurementId) return;

    // Create script element for Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    // Configure Google Analytics
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector(`script[src*="${measurementId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
};