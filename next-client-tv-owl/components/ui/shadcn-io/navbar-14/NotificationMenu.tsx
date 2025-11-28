'use client';

import * as React from 'react';
import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationInterface } from '.';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NotificationMenuProps {
  notifications: NotificationInterface[];
  onNotificationClick?: (id: string) => void;
  getLatestNotifications: () => void;
  hasMoreNotifications: Boolean;
}

export const NotificationMenu = React.forwardRef<
  HTMLButtonElement,
  NotificationMenuProps
>(({ notifications, onNotificationClick, getLatestNotifications, hasMoreNotifications }, ref) => {
  const unreadCount = notifications.length;
  const getTimeAgo = (parsedMs: string) => {
    const msAgo = Date.now() - Number(parsedMs);

    const seconds = Math.floor(msAgo / 1000);
    if (seconds < 60) return seconds === 1 ? "1 second" : `${seconds} seconds`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? "1 minute" : `${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour" : `${hours} hours`;

    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day" : `${days} days`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week" : `${weeks} weeks`;

    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month" : `${months} months`;

    const years = Math.floor(months / 12);
    return years === 1 ? "1 year" : `${years} years`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          size="icon"
          variant="ghost"
          className="text-muted-foreground relative size-8 rounded-full shadow-none  hidden lg:flex justify-center items-center"
          aria-label="Notifications"
        >
          <BellIcon size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification._id}
            className="flex flex-col items-start p-3 cursor-pointer"
            onClick={() => {
              if (onNotificationClick) {
                onNotificationClick(notification._id);
              }
            }}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getTimeAgo(String(Date.parse(notification.createdAt)))}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {hasMoreNotifications ? (<DropdownMenuItem className="text-center justify-center hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            getLatestNotifications();
          }}>
          View more notifications
        </DropdownMenuItem>) : (<DropdownMenuItem className="text-center justify-center" disabled>
          No more notifications!
        </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NotificationMenu.displayName = 'NotificationMenu';

export default NotificationMenu;