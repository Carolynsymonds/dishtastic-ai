import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface UtmParams {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
}

const UTM_STORAGE_KEY = 'utm_params';

export const useUtmTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  console.log('UTM Tracking hook initialized for location:', location.pathname, location.search);

  // Capture and store UTM parameters on initial page load
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hasUtmParams = Array.from(urlParams.keys()).some(key => key.startsWith('utm_'));
    
    console.log('Current URL search params:', location.search);
    console.log('All URL params:', Object.fromEntries(urlParams.entries()));
    console.log('Has UTM params:', hasUtmParams);
    
    if (hasUtmParams) {
      const utmParams: UtmParams = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
      };

      
      // Store UTM parameters in localStorage
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
      console.log('UTM parameters captured and stored:', utmParams);
    } else {
      console.log('No UTM parameters found in URL');
    }
  }, [location.search]);

  // Get stored UTM parameters
  const getStoredUtmParams = (): UtmParams => {
    try {
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      const params = stored ? JSON.parse(stored) : {};
      console.log('Retrieved stored UTM params:', params);
      return params;
    } catch {
      console.log('Failed to retrieve UTM params from localStorage');
      return {};
    }
  };

  // Create URL with UTM parameters
  const createUrlWithUtm = (path: string, additionalParams?: Record<string, string>): string => {
    const storedParams = getStoredUtmParams();
    const params = new URLSearchParams();
    
    // Add stored UTM parameters
    Object.entries(storedParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    // Add additional parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
    
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  // Navigate with UTM parameters
  const navigateWithUtm = (path: string, additionalParams?: Record<string, string>) => {
    const storedParams = getStoredUtmParams();
    console.log('Navigating with stored UTM params:', storedParams);
    const urlWithUtm = createUrlWithUtm(path, additionalParams);
    console.log('Created URL with UTM:', urlWithUtm);
    navigate(urlWithUtm);
  };

  return {
    getStoredUtmParams,
    createUrlWithUtm,
    navigateWithUtm,
  };
};