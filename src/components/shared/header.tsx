"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Box,
  Wallet,
  Ruler,
  Wand2,
  Menu,
  Search,
  CircleUser,
  ChevronDown,
  X,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { UvaniLogo } from '../icons';
import Notifications from './Notifications';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/orders', icon: Box, label: 'Orders' },
  { href: '/finance', icon: Wallet, label: 'Finance' },
  { href: '/measurements', icon: Ruler, label: 'Measurements' },
  { href: '/pricing-tool', icon: Wand2, label: 'AI Pricing' },
];


export function AppHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const { setOpenMobile } = useSidebar();

  // Notification state (must be inside function)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkSize = () => setIsSmall(window.innerWidth < 640);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Get user email from localStorage or Supabase auth
  useEffect(() => {
    async function getEmail() {
      let email = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) email = userData.user.email;
      } catch {}
      if (!email && typeof window !== 'undefined') {
        email = localStorage.getItem('uvani_signup_email');
      }
      setUserEmail(email);
    }
    getEmail();
  }, []);

  // Fetch notifications from Supabase when userEmail is available
  // create a reusable fetch function so we can call it on open or on demand
  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const { data, error } = await supabase
        .from('tailors')
        .select('notification_message')
        .eq('email', userEmail)
        .maybeSingle();
      if (!error && data && Array.isArray(data.notification_message)) {
        setNotifications(data.notification_message);
        setUnreadCount(data.notification_message.filter((n: any) => n.read === false).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications', e);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => { fetchNotifications(); }, [userEmail]);

  // mark a single notification read (updates DB and local state)
  const markNotificationRead = async (notifId: string) => {
    if (!userEmail) return;
    try {
      // fetch current array
      const { data: row } = await supabase.from('tailors').select('id,notification_message').eq('email', userEmail).maybeSingle();
      const arr = Array.isArray(row?.notification_message) ? row.notification_message : [];
      const updated = arr.map((n: any) => n.id === notifId ? { ...n, read: true } : n);
      const { error } = await supabase.from('tailors').update({ notification_message: updated }).eq('email', userEmail);
      if (!error) {
        setNotifications(updated);
        setUnreadCount(updated.filter((n: any) => !n.read).length);
      }
    } catch (e) { console.error('markNotificationRead error', e); }
  };

  const markAllRead = async () => {
    if (!userEmail) return;
    try {
      const { data: row } = await supabase.from('tailors').select('id,notification_message').eq('email', userEmail).maybeSingle();
      const arr = Array.isArray(row?.notification_message) ? row.notification_message : [];
      const updated = arr.map((n: any) => ({ ...n, read: true }));
      const { error } = await supabase.from('tailors').update({ notification_message: updated }).eq('email', userEmail);
      if (!error) {
        setNotifications(updated);
        setUnreadCount(0);
      }
    } catch (e) { console.error('markAllRead error', e); }
  };

  const getCurrentPage = () => {
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    return currentNavItem
      ? { label: currentNavItem.label, icon: currentNavItem.icon }
      : { label: 'Uvani', icon: UvaniLogo };
  };

  // Profile info
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

  const router = useRouter();

  const goToSettings = () => router.push('/settings');
  const openSupport = () => { if (typeof window !== 'undefined') window.location.href = 'mailto:support@uvani.com'; };
  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.warn('Sign out failed', e); }
    try { if (typeof window !== 'undefined') { localStorage.removeItem('uvani_signup_email'); localStorage.removeItem('uvani_settings'); } } catch (e) {}
    toast({ title: 'Signed out', description: 'You have been signed out.' });
    router.push('/signin');
  };

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!mounted) return;
      try {
        let email: string | null = null;
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.email) email = userData.user.email;
        } catch (e) {}
        if (!email && typeof window !== 'undefined') email = localStorage.getItem('uvani_signup_email');
        if (!email) return;

        setProfileEmail(email);

        const { data, error } = await supabase.from('tailors').select('name,profile_picture,avatar').eq('email', email).maybeSingle();
        if (error || !data) return;
        setProfileName(data.name || null);
        let pp = data.profile_picture || data.avatar || null;
        if (pp && typeof pp === 'string' && !pp.startsWith('http')) {
          try {
            const { data: urlData } = supabase.storage.from('Images').getPublicUrl(pp);
            pp = urlData?.publicUrl || pp;
          } catch (e) {
            // ignore, use raw value
          }
        }
        setProfileAvatar(pp || null);
      } catch (e) {
        console.warn('Failed to load header profile', e);
      }
    };
    loadProfile();

    const onProfileUpdated = (ev: any) => {
      // re-run loadProfile when other parts of the app signal an update
      loadProfile();
    };
    window.addEventListener('uvani:profile-updated', onProfileUpdated as EventListener);
    return () => { mounted = false; window.removeEventListener('uvani:profile-updated', onProfileUpdated as EventListener); };
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 px-3 sm:px-4 lg:px-6 flex items-center",
      isScrolled && "shadow-md h-14"
    )}>
  <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Uvani logo (mobile only) */}
        <div className="md:hidden flex items-center mr-2">
          <Link href="/" aria-label="Uvani home" className="inline-flex items-center">
            <img src="/UVANI logo.png" alt="Uvani" className="h-10 w-auto object-contain" draggable={false} />
          </Link>
        </div>
        {/* Left: Current Page Name and Icon */}
        <div className="flex items-center gap-3 min-w-0">
          {(() => {
            const { label, icon: Icon } = getCurrentPage();
            return (
              <>
                <Icon className="h-7 w-7 text-primary shrink-0" />
                <span className="hidden sm:inline-block text-xl font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap max-w-[20ch] overflow-hidden text-ellipsis">{label}</span>
              </>
            );
          })()}
        </div>

        {/* Center: Search Bar */}
        <div className={cn(
          "flex-1 flex justify-center min-w-0",
          searchOpen
            ? "max-w-[calc(100%-6rem)] sm:max-w-xl"
            : "max-w-[calc(100%-8rem)] sm:max-w-md"
        )}>
          <div className="relative w-full max-w-lg">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-opacity" />
              <Input
                type="text"
                placeholder={isSmall ? "Search" : "Search orders, customers, products..."}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => !searchValue && setSearchOpen(false)}
                className={cn(
                  "w-full pl-10 pr-10 transition-all duration-300 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  searchOpen && "bg-background shadow-sm"
                )}
              />
              {searchValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() => setSearchValue('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Notification and Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Notifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-visible">
                {/* Use gradient background only when there's no profile image */}
                <div className={
                  `flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${profileAvatar ? 'bg-transparent' : 'bg-gradient-to-r from-primary to-purple-600 text-white'}`
                }>
                  <Avatar className="h-9 w-9">
                    {profileAvatar ? (
                      <AvatarImage src={profileAvatar} alt={profileName || 'User'} className="object-cover" />
                    ) : (
                      <AvatarFallback>{(profileName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profileName ?? 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profileEmail ?? '—'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goToSettings} className="cursor-pointer transition-colors focus:bg-accent/50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openSupport} className="cursor-pointer transition-colors focus:bg-accent/50">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}