import { Bell, X, CheckCircle, AlertCircle, Info, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "assignment" | "post" | "reaction" | "deadline" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  course?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "deadline":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "reaction":
      case "post":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    console.log(`Marking notification ${id} as read`);
    onMarkAsRead?.(id);
  };

  const handleDismiss = (id: string) => {
    console.log(`Dismissing notification ${id}`);
    onDismiss?.(id);
  };

  const handleMarkAllAsRead = () => {
    console.log("Marking all notifications as read");
    onMarkAllAsRead?.();
  };

  return (
    <Card data-testid="panel-notifications">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" data-testid="badge-unread-count">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              data-testid="button-mark-all-read"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    !notification.isRead 
                      ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" 
                      : "bg-card hover:bg-muted/50"
                  )}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium line-clamp-1" data-testid={`text-notification-title-${notification.id}`}>
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-50 hover:opacity-100"
                        onClick={() => handleDismiss(notification.id)}
                        data-testid={`button-dismiss-${notification.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {notification.course && (
                          <Badge variant="outline" className="text-xs">
                            {notification.course}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${notification.id}`}>
                          {notification.timestamp}
                        </span>
                      </div>
                      
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
