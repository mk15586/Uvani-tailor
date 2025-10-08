"use client";

import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/shared/header";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const pathname = usePathname();

  // Apply user's dark mode preference globally for all pages
  useEffect(() => {
    let mounted = true;
    const applyDark = (isDark: boolean) => {
      try {
        if (typeof window === 'undefined') return;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // persist to localStorage so static pages/components can read quickly
        try {
          const saved = JSON.parse(localStorage.getItem('uvani_settings') || '{}');
          saved.darkMode = Boolean(isDark);
          localStorage.setItem('uvani_settings', JSON.stringify(saved));
        } catch (e) {}
      } catch (e) {
        // ignore
      }
    };

    const loadTheme = async () => {
      try {
        let email: string | null = null;
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.email) email = userData.user.email;
        } catch (e) {}
        if (!email && typeof window !== 'undefined') email = localStorage.getItem('uvani_signup_email');
        if (!email) return;
        const { data, error } = await supabase.from('tailors').select('dark_mode').eq('email', email).maybeSingle();
        if (error) return;
        if (!mounted) return;
        applyDark(Boolean(data?.dark_mode));
      } catch (e) {
        // ignore
      }
    };

    loadTheme();

    const onProfileUpdated = () => { loadTheme(); };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'uvani_settings') {
        // re-apply if darkMode changed in localStorage
        try {
          const s = JSON.parse(ev.newValue || '{}');
          if (typeof s.darkMode !== 'undefined') applyDark(Boolean(s.darkMode));
        } catch (e) {}
      }
    };

    window.addEventListener('uvani:profile-updated', onProfileUpdated as EventListener);
    window.addEventListener('storage', onStorage);

    return () => { mounted = false; window.removeEventListener('uvani:profile-updated', onProfileUpdated as EventListener); window.removeEventListener('storage', onStorage); };
  }, []);

  if (pathname === "/complete-registration") {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen w-full">
      <div className="flex">
        <AppSidebar />
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-500 ease-in-out",
            // apply left margin only on md+ so mobile uses full width
            state === "expanded"
              ? "md:ml-[220px] lg:ml-[280px]"
              : "md:ml-[68px]"
          )}
        >
          <AppHeader />
          {children}
          <MobileBottomNav />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
