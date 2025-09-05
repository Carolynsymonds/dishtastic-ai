import { useState } from "react";
import { Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'delivery';
  title: string;
  message: string;
  timestamp?: Date;
}

interface NotificationCenterProps {
  notifications?: NotificationItem[];
  lowStockItems?: Array<{ id: string; name: string; currentStock: number; minThreshold: number }>;
}

export function NotificationCenter({ notifications = [], lowStockItems = [] }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Create notifications from low stock items
  const lowStockNotifications: NotificationItem[] = lowStockItems.map(item => ({
    id: `low-stock-${item.id}`,
    type: 'low-stock' as const,
    title: 'Low Stock Alert',
    message: `${item.name} is running low (${item.currentStock} remaining)`,
    timestamp: new Date(),
  }));

  const allNotifications = [...notifications, ...lowStockNotifications];
  const unreadCount = allNotifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {allNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications at this time
            </div>
          ) : (
            <div className="space-y-1">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="mt-1">
                    {notification.type === 'low-stock' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    {notification.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {allNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setIsOpen(false)}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}