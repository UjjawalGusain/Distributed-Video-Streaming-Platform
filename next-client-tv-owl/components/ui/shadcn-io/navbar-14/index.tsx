'use client';

import * as React from 'react';
import { useId, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGridIcon,
  PlusIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import InfoMenu from './InfoMenu';
import NotificationMenu from './NotificationMenu';
import SettingsMenu from './SettingsMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import SignInButton from '@/components/SignInButton';
import SignOutButton from '@/components/SignOutButton';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';

export interface Navbar14Props extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    unread?: boolean;
  }>;
  onSearchChange?: (value: string) => void;
  onLayoutClick?: () => void;
  onAddClickWithLoggedIn?: () => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationClick?: (notificationId: string) => void;
  onSettingsItemClick?: (item: string) => void;
  addLink: string;
}

export const Navbar14 = React.forwardRef<HTMLElement, Navbar14Props>(
  (
    {
      className,
      searchPlaceholder = 'Search...',
      searchValue,
      notifications,
      onSearchChange,
      onLayoutClick,
      onInfoItemClick,
      onNotificationClick,
      onSettingsItemClick,
      addLink,
      children,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const username = session?.user?.username ?? "Anonymous";
    const avatarSrc = session?.user?.image ?? "/default_avatar_light.png";


    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const onAddClickWithoutSignedIn = () => {
      toast("Sign in first to publish videos");
      console.log("avatarSrc: ", avatarSrc);

    }

    return (
      <header
        ref={ref}
        className={cn(
          'border-b border-border/50 bg-linear-to-b from-background/80 to-background/40 backdrop-blur-md px-2 md:px-4 transition-colors duration-300',
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            {children}

            <span className="text-xl font-semibold text-foreground tracking-tight hover:text-primary transition-colors hover:cursor-pointer" onClick={() => { router.push('/home') }}>
              TV Owl
            </span>
            <img
              src="/tv_owl_icon_dark_no_bg.png"
              alt="TV Owl"
              className="h-10 w-10 object-contain drop-shadow-[0_0_4px_rgba(255,255,255,0.15)] hover:cursor-pointer"
              onClick={() => { router.push('/home') }}
            />

          </div>

          {/* Center search */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Input
              id={`input-${id}`}
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="peer h-10 w-full rounded-full bg-muted/20 border-border/30 text-sm ps-9 pe-3 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <div className="absolute inset-y-0 start-2 flex items-center pointer-events-none text-muted-foreground/70">
              <SearchIcon size={16} />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Auth */}
            {!session ? (
              <SignInButton />
            ) : (
              <div className="flex items-center gap-2">
                <SignOutButton />
              </div>
            )}

            {/* Theme toggle */}
            <Button
              size="icon"
              variant="ghost"
              aria-label="Toggle theme"
              onClick={() =>
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }
              className="rounded-full hover:bg-muted/30 transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon size={16} />
              ) : (
                <MoonIcon size={16} />
              )}
            </Button>

            {/* Layout and menus */}

            <InfoMenu onItemClick={onInfoItemClick} />
            <NotificationMenu
              notifications={notifications}
              onNotificationClick={onNotificationClick}
            />
            <SettingsMenu onItemClick={onSettingsItemClick} />

            {/* Add */}
            {session?.user ? (
              <Link href={addLink}>
                <Button
                  size="icon"
                  variant="default"
                  className="rounded-full bg-primary/90 hover:bg-primary transition-all shadow-md"
                  aria-label="Add"
                >
                  <PlusIcon size={16} />
                </Button>
              </Link>
            ) : (
              <Button
                size="icon"
                variant="default"
                className="rounded-full bg-primary/90 hover:bg-primary transition-all shadow-md"
                aria-label="Add"
                onClick={onAddClickWithoutSignedIn}
              >
                <PlusIcon size={16} />
              </Button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm font-sans text-foreground tracking-tight underline underline-offset-2 ">
                {session?.user?.username || "Anonymous"}
              </span>

              <Avatar className="rounded-lg size-10">
                <AvatarImage
                  src={avatarSrc}
                  alt={username}
                />
                <AvatarFallback>{username.split(" ")
                  .map(word => word[0]?.toUpperCase())
                  .join("")}</AvatarFallback>
              </Avatar>


            </div>
          </div>
        </div>
      </header>
    );
  }
);

Navbar14.displayName = 'Navbar14';

export { InfoMenu, NotificationMenu, SettingsMenu };
