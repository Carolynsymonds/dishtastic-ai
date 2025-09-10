import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurityAlertProps {
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const SecurityAlert = ({ 
  type, 
  title, 
  message, 
  action, 
  onDismiss 
}: SecurityAlertProps) => {
  const getIcon = () => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'critical':
        return 'border-destructive bg-destructive/10';
      case 'warning':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'info':
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <Alert className={`mb-4 ${getAlertClass()}`}>
      {getIcon()}
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {action && (
          <div className="mt-3">
            <Button 
              variant={type === 'critical' ? 'destructive' : 'secondary'} 
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};