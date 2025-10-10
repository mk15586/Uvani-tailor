"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Box,
  Wallet,
  Ruler,
  Wand2,
  Search,
  ChevronDown,
  X,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UvaniLogo } from '../icons';
import Notifications from './Notifications';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

const navItems = [
  { href: '/orders', icon: Box, label: 'Orders' },
  { href: '/finance', icon: Wallet, label: 'Finance' },
  { href: '/measurements', icon: Ruler, label: 'Measurements' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);

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
    const checkSize = () => {
      const small = window.innerWidth < 640;
      setIsSmall(small);
      if (!small) {
        setMobileSearchOpen(false);
      }
    };
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateFromDocument = () => {
      const hasDark = document.documentElement.classList.contains('dark');
      setIsDark(hasDark);
    };
    updateFromDocument();
    const observer = new MutationObserver(updateFromDocument);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  const toggleDarkMode = async (value: boolean) => {
    if (typeof window === 'undefined') return;
    setIsDark(value);
    const root = document.documentElement;
    if (value) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      const stored = JSON.parse(localStorage.getItem('uvani_settings') || '{}');
      stored.darkMode = value;
      localStorage.setItem('uvani_settings', JSON.stringify(stored));
    } catch (e) {}

    let email: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      email = data?.user?.email ?? null;
    } catch (e) {}
    if (!email && typeof window !== 'undefined') {
      email = localStorage.getItem('uvani_signup_email');
    }
    if (!email) return;

    try {
      await supabase.from('tailors').update({ dark_mode: value }).eq('email', email);
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('uvani:profile-updated'));
    }
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
    <TooltipProvider delayDuration={150}>
      <header
        className={cn(
          "sticky top-0 z-[45] w-full border-b border-slate-200/40 bg-white/80 px-3 py-3 transition-all duration-300 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-white/10 dark:bg-[#070a17]/80 sm:px-5 lg:px-8 rounded-b-3xl",
          isScrolled
            ? "shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_36px_rgba(3,7,18,0.55)]"
            : "shadow-none"
        )}
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          {/* Left: Current page identity block */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              aria-label="Uvani home"
              className="inline-flex h-10 w-auto items-center gap-2 rounded-2xl bg-slate-900/90 px-3 text-white shadow-[0_10px_30px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:scale-[1.03] sm:hidden"
            >
              <img
                src="/UVANI logo.png"
                alt="Uvani"
                className="h-7 w-auto"
                draggable={false}
                loading="lazy"
              />
              <span className="text-sm font-semibold tracking-[0.24em] uppercase text-white/80">
                Uvani
              </span>
            </Link>
            <Link
              href="/"
              aria-label="Uvani home"
              className="hidden sm:inline-flex sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition-transform duration-200 hover:scale-[1.03]"
            >
              {(() => {
                const { icon: Icon } = getCurrentPage();
                return <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />;
              })()}
            </Link>
            {(() => {
              const { label } = getCurrentPage();
              return (
                <div className="flex min-w-0 flex-col">
                  <span className="hidden text-[10px] uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400 sm:block">
                    Uvani Tailor Suite
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-lg font-semibold text-slate-900 dark:text-white sm:text-xl lg:text-2xl">
                      {label}
                    </span>
                    <span className="hidden rounded-full border border-slate-200/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 dark:border-white/20 dark:text-slate-300 sm:inline-flex">
                      Live
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Center: Elevated search */}
          <div
            className={cn(
              "order-last w-full justify-center sm:order-none sm:flex sm:flex-1",
              mobileSearchOpen ? "flex" : "hidden"
            )}
          >
            <div className="group/search relative w-full max-w-xl">
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-amber-400/10 opacity-0 transition-opacity duration-300 group-focus-within/search:opacity-100" />
              <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/70 backdrop-blur dark:border-white/20 dark:bg-slate-900/70">
                <Search className="ml-4 h-4 w-4 text-slate-400 transition-colors dark:text-white/70" />
                <Input
                  type="text"
                  placeholder={isSmall ? "Search dashboard" : "Search orders, customers, products..."}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => {
                    if (!searchValue) {
                      setSearchOpen(false);
                      if (isSmall) {
                        setMobileSearchOpen(false);
                      }
                    }
                  }}
                  className={cn(
                    "h-11 w-full rounded-none border-0 bg-transparent pl-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 dark:text-white dark:placeholder:text-slate-400",
                    searchOpen && "shadow-inner"
                  )}
                />
                {searchValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 h-7 w-7 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setSearchValue('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick actions, notifications, profile */}
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSearchOpen((prev) => !prev)}
                  className={cn(
                    "h-10 w-10 rounded-full border border-slate-200/70 bg-white/60 text-slate-500 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-200 sm:hidden",
                    mobileSearchOpen && "bg-white text-slate-700 dark:bg-white/15"
                  )}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Search</TooltipContent>
            </Tooltip>
            <Notifications />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="group relative flex h-11 items-center gap-2 rounded-full border border-slate-200/70 bg-white pl-1 pr-3 text-slate-800 shadow-[0_18px_42px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:scale-[1.01] dark:border-white/10 dark:bg-white/10 dark:text-white"
                >
                  <Avatar className="h-9 w-9 border border-slate-200 shadow-sm ring-2 ring-white/60 transition-shadow group-hover:ring-violet-200 group-hover:shadow-md dark:border-white/20 dark:ring-slate-900/70 dark:group-hover:ring-violet-500/40">
                    {profileAvatar ? (
                      <AvatarImage src={profileAvatar} alt={profileName || 'User'} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                        {(profileName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden text-left text-xs font-medium leading-tight text-slate-800 sm:block dark:text-white">
                    <span className="block truncate text-sm font-semibold">
                      {profileName ?? 'User'}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500 dark:text-white/70">
                      {profileEmail ?? '—'}
                    </span>
                  </div>
                  <ChevronDown className="ml-1 hidden h-4 w-4 text-slate-500 sm:block dark:text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/98 p-0 shadow-[0_28px_60px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-900/92 dark:to-slate-950/95"
                align="end"
                forceMount
              >
                <div className="relative flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-5 dark:border-white/10 dark:bg-white/5">
                  <Avatar className="h-12 w-12 border border-white/70 shadow ring-4 ring-white/70 dark:border-white/15 dark:ring-slate-900/60">
                    {profileAvatar ? (
                      <AvatarImage src={profileAvatar} alt={profileName || 'User'} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-base font-semibold text-white">
                        {(profileName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 text-slate-800 dark:text-white">
                    <p className="text-sm font-semibold">
                      {profileName ?? 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {profileEmail ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 px-4 py-5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-slate-800 shadow-sm dark:bg-white/10 dark:text-slate-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Dark mode</span>
                      <span className="text-xs text-slate-500 dark:text-slate-300">Toggle the interface theme</span>
                    </div>
                    <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
                  </div>
                  <DropdownMenuItem asChild className="focus:bg-transparent focus:outline-none">
                    <button
                      type="button"
                      onClick={goToSettings}
                      className="group flex w-full items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-slate-800 transition-all hover:bg-violet-500/10 hover:text-violet-700 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform group-hover:-translate-y-0.5 dark:bg-white/10 dark:text-white">
                        <Settings className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">Account settings</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-transparent focus:outline-none">
                    <button
                      onClick={openSupport}
                      className="group flex w-full items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-slate-800 transition-all hover:bg-violet-500/10 hover:text-violet-700 dark:bg-white/10 dark:text-slate-200 dark:hover:text-white"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform group-hover:-translate-y-0.5 dark:bg-white/10 dark:text-white">
                        <HelpCircle className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">Contact support</span>
                    </button>
                  </DropdownMenuItem>
                </div>
                <div className="border-t border-slate-200/70 px-4 py-4 dark:border-white/10">
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 py-2 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-500/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}