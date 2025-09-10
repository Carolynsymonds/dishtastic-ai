import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Component to listen for security events and show user-friendly toast messages
 */
export const SecurityToastListener = () => {
  useEffect(() => {
    // Listen for security warnings
    const handleSecurityWarning = (event: CustomEvent) => {
      toast.warning('Security Alert', {
        description: event.detail.message,
        duration: 5000,
      });
    };

    // Listen for security breaches
    const handleSecurityBreach = (event: CustomEvent) => {
      toast.error('Security Breach Detected', {
        description: event.detail.message,
        duration: 8000,
      });
    };

    // Add event listeners
    window.addEventListener('security-warning', handleSecurityWarning as EventListener);
    window.addEventListener('security-breach', handleSecurityBreach as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('security-warning', handleSecurityWarning as EventListener);
      window.removeEventListener('security-breach', handleSecurityBreach as EventListener);
    };
  }, []);

  return null; // This component doesn't render anything
};