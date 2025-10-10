"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Box,
  Wallet,
  Ruler,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { href: "/orders", icon: Box, label: "Orders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/measurements", icon: Ruler, label: "Measurements" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveAvatarUrl = async (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      try {
        const { data } = supabase.storage.from("Images").getPublicUrl(path);
        return data?.publicUrl ?? path;
      } catch (e) {
        return path;
      }
    };

    const loadProfile = async () => {
      try {
        let email: string | null = null;
        try {
          const { data } = await supabase.auth.getUser();
          email = data?.user?.email ?? null;
        } catch (e) {
          email = null;
        }
        if (!email && typeof window !== "undefined") {
          email = window.localStorage.getItem("uvani_signup_email");
        }
        if (!email) return;

        const { data, error } = await supabase
          .from("tailors")
          .select("name, profile_picture, avatar")
          .eq("email", email)
          .maybeSingle();

        if (!mounted) return;

        if (error || !data) {
          setProfileName("");
          setProfileEmail(email);
          setProfileAvatar(null);
          return;
        }

        setProfileName(data.name ?? "");
        setProfileEmail(email);
        const avatarUrl = await resolveAvatarUrl(data.profile_picture || data.avatar || null);
        if (mounted) {
          setProfileAvatar(avatarUrl);
        }
      } catch (e) {
        if (mounted) {
          setProfileName("");
          setProfileAvatar(null);
        }
      }
    };

    loadProfile();

    const onProfileUpdated = () => {
      loadProfile();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("uvani:profile-updated", onProfileUpdated as EventListener);
    }

    return () => {
      mounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("uvani:profile-updated", onProfileUpdated as EventListener);
      }
    };
  }, []);

  const fallbackInitials = profileName
    ? profileName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profileEmail
    ? profileEmail.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="z-[60] border-r border-sidebar-border/60 bg-[#0c0d16] transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen"
      >
      <div className="flex h-full w-full flex-col bg-[#0c0d16]">
        <div
          className={cn(
            "relative flex h-24 items-center justify-between border-b border-white/5 px-4",
            isCollapsed && "px-2"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "gap-2"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200",
                isCollapsed ? "scale-90" : "scale-100"
              )}
            >
              <img
                src="/UVANI logo.png"
                alt="Uvani logo"
                className="h-8 w-auto"
                draggable={false}
                loading="lazy"
              />
            </div>
            <div
              className={cn(
                "leading-tight text-white transition-all duration-200",
                isCollapsed ? "pointer-events-none opacity-0 -translate-x-3" : "opacity-100 translate-x-0"
              )}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Uvani</p>
              <p className="text-lg font-semibold">Tailor Suite</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex items-center justify-center rounded-full border border-white/12 text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              isCollapsed
                ? "absolute top-1/2 h-10 w-10 -translate-y-1/2 bg-[#11121e] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                : "ml-3 h-9 w-9 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
            )}
            style={isCollapsed ? { right: "-18px" } : undefined}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <SidebarContent className="flex-1 px-3 py-5">
          <SidebarMenu className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={isCollapsed ? {
                      children: item.label,
                      className: "font-sans bg-gray-900 text-white py-1.5 px-3",
                    } : undefined}
                    className={cn(
                      "group relative rounded-2xl border border-transparent px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200",
                      isActive
                        ? "border-white/15 bg-white/5 text-white"
                        : "hover:border-white/10 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-all duration-200 group-hover:text-white">
                        {isActive && (
                          <span className="absolute inset-0 rounded-xl border border-white/20" />
                        )}
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between">
                          <span className="leading-none">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-white/20 transition-opacity duration-200",
                              isActive ? "opacity-70" : "opacity-0 group-hover:opacity-40"
                            )}
                          />
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/5 px-3 py-5">
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center gap-2",
                isCollapsed && "flex-col gap-3"
              )}
            >
              <SidebarMenuButton
                asChild
                tooltip={isCollapsed ? {
                  children: "Settings",
                  className: "font-sans bg-gray-900 text-white py-1.5 px-3",
                } : undefined}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white",
                  isCollapsed ? "justify-center" : "flex-[1.1]"
                )}
              >
                <Link href="/settings" className="flex items-center justify-center gap-2">
                  <Settings className="h-4 w-4" />
                  {!isCollapsed && <span>Settings</span>}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton
                asChild
                tooltip={isCollapsed ? {
                  children: "Logout",
                  className: "font-sans bg-gray-900 text-white py-1.5 px-3",
                } : undefined}
                className={cn(
                  "rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100 transition-colors duration-200 hover:border-rose-500/40 hover:bg-rose-500/15",
                  isCollapsed ? "justify-center" : "flex-1"
                )}
              >
                <Link href="/signin" className="flex items-center justify-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Logout</span>}
                </Link>
              </SidebarMenuButton>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Avatar className="h-10 w-10 border border-white/15">
                {profileAvatar && <AvatarImage src={profileAvatar} />}
                <AvatarFallback className="bg-slate-700 text-xs font-semibold text-white">
                  {fallbackInitials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {profileName || "User"}
                  </p>
                  <p className="truncate text-xs text-white/60">
                    {profileEmail || ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
    </>
  );
}

