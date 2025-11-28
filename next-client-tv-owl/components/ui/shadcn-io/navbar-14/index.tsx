'use client';

import * as React from 'react';
import { useId, useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
import SignInButton from '@/components/Header/SignInButton';
import SignOutButton from '@/components/Header/SignOutButton';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import Image from 'next/image';
import { ItemMedia } from '../../item';
import { NotificationInterface } from '@/app/notification/page';

export interface Navbar14Props extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  notifications: Array<NotificationInterface>;
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
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const router = useRouter();
    const username = session?.user?.username ?? "Anonymous";

    useEffect(() => setMounted(true), []);

    const onAddClickWithoutSignedIn = () => {
      toast("Sign in first to publish videos");
    };

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          setShowMobileSearch(false);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return <Loading />;

    return (
      <header
        ref={ref}
        className={cn(
          'border-b border-border/50 bg-linear-to-b from-background/80 to-background/40 backdrop-blur-md px-2 transition-colors duration-300',
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between gap-4">

          {/* LEFT SECTION — Always visible */}
          <div className="flex items-center gap-3 mr-3">
            {children}

            <span
              className="text-sm sm:text-md md:text-xl lg:text-2xl font-semibold text-foreground tracking-tight hover:text-primary transition-colors hover:cursor-pointer text-nowrap"
              onClick={() => router.push('/home')}
            >
              TV Owl
            </span>

            <img
              src="/tv_owl_icon_dark_no_bg.png"
              alt="TV Owl"
              className="h-10 w-10 object-contain drop-shadow-[0_0_4px_rgba(255,255,255,0.15)] hover:cursor-pointer"
              onClick={() => router.push('/home')}
            />
          </div>

          {/* WHEN MOBILE SEARCH IS ACTIVE → HIDE EVERYTHING ELSE */}
          {showMobileSearch && (
            <div className="absolute top-0 h-16 flex items-center bg-background px-3 md:hidden">

              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="h-10 flex-1 rounded-full bg-muted/20 border-border/30 text-sm"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileSearch(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* ONLY show this when mobile search is NOT active */}
          {!showMobileSearch && (
            <>
              {/* Desktop Search */}
              <div className="relative flex-1 max-w-md hidden sm:block">
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

              {/* Mobile Search Button */}
              <button
                className="sm:hidden rounded-full text-muted-foreground hover:bg-muted/30 transition-colors"
                onClick={() => setShowMobileSearch(true)}
              >
                <SearchIcon size={40} className="text-foreground" />
              </button>
              

              {/* RIGHT SECTION */}
              <div className="flex items-center gap-3">

                <div className='w-fit hidden sm:flex'>{!session ? <SignInButton /> : <SignOutButton />}</div>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full hover:bg-muted/30 transition-colors hidden lg:flex justify-center items-center"
                >
                  {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                </Button>

                <InfoMenu onItemClick={onInfoItemClick} />

                <NotificationMenu
                  notifications={notifications}
                  onNotificationClick={onNotificationClick}
                />

                <SettingsMenu onItemClick={onSettingsItemClick} />

                {session?.user ? (
                  <Link href={addLink}>
                    <Button
                      size="icon"
                      variant="default"
                      className="rounded-full bg-primary/90 hover:bg-primary transition-all shadow-md hidden lg:flex justify-center items-center"
                      aria-label="Add"
                    >
                      <PlusIcon size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="icon"
                    variant="default"
                    className="rounded-full bg-primary/90 hover:bg-primary transition-all shadow-md hidden lg:flex justify-center items-center "
                    aria-label="Add"
                    onClick={onAddClickWithoutSignedIn}
                  >
                    <PlusIcon size={16} />
                  </Button>
                )}

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-sans text-foreground tracking-tight underline underline-offset-2 text-nowrap` + (session?.user ? " hover:cursor-pointer" : "")}
                    onClick={() => {
                      if (!session?.user) return;
                      router.push(`/user/${session?.user?.id}`)
                    }}>
                    {username}
                  </span>

                  {session?.user?.avatar && (
                    <ItemMedia>
                      <Image
                        src={session.user.avatar}
                        className="h-9 w-9 rounded-full bg-secondary object-contain border hover:cursor-pointer"
                        alt=""
                        height={32}
                        width={32}
                        onClick={() => { router.push(`/user/${session?.user?.id}`) }}
                      />
                    </ItemMedia>
                  )}
                  {!session?.user?.avatar && (
                    <ItemMedia>
                      <Image
                        src={"/default_avatar.png"}
                        className="h-9 w-9 rounded-full bg-secondary object-contain border"
                        alt=""
                        height={32}
                        width={32}

                      />
                    </ItemMedia>
                  )}
                </div>

              </div>
            </>
          )}

        </div>
      </header>
    );
  }
);

Navbar14.displayName = 'Navbar14';

export { InfoMenu, NotificationMenu, SettingsMenu };
