"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UvaniLogo } from "@/components/icons";
import {
  LayoutDashboard,
  Box,
  Wallet,
  Ruler,
  Wand2,
  LogOut,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: Box, label: "Orders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/measurements", icon: Ruler, label: "Measurements" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="fixed h-full z-50 border-r border-sidebar-border/50 bg-[#1A1126] transition-all duration-500 ease-in-out hidden md:block shadow-xl"
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="relative">
            <SidebarTrigger
              className={cn(
                "group rounded-full p-1.5 hover:bg-white/10 transition-all duration-300 absolute z-10",
                state === "collapsed"
                  ? "top-6 left-1/2 -translate-x-1/2"
                  : "top-9 right-3"
              )}
            >
              {state === "collapsed" ? (
                <ChevronRight className="h-4 w-4 text-white/70 group-hover:text-white transition-colors duration-300" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-white/70 group-hover:text-white transition-colors duration-300" />
              )}
            </SidebarTrigger>
            <SidebarHeader
              className={cn("h-24 flex items-center justify-center p-4")}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center transition-opacity duration-300 w-full",
                  state === "collapsed" ? "opacity-0" : "opacity-100"
                )}
              >
                <img
                  src="/UVANI logo.png"
                  alt="Uvani Logo"
                  className="h-14 w-auto sm:h-16 md:h-20 object-contain z-10 drop-shadow-lg"
                  draggable={false}
                />
              </div>
            </SidebarHeader>
          </div>
          <SidebarContent className="flex-1 p-3">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href} className="relative my-1">
                    {isActive && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={{
                        children: item.label,
                        className:
                          "font-sans bg-gray-900 text-white py-1.5 px-3",
                      }}
                      className={cn(
                        "justify-start gap-3 rounded-xl transition-all duration-300 overflow-hidden group",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-white shadow-md"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                      onMouseEnter={() => setActiveHover(item.href)}
                      onMouseLeave={() => setActiveHover(null)}
                    >
                      <Link href={item.href}>
                        <div className="relative">
                          <div
                            className={cn(
                              "absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full scale-0 transition-transform duration-300",
                              activeHover === item.href || isActive
                                ? "scale-100"
                                : "scale-0"
                            )}
                          />
                          <item.icon className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className="transition-all duration-300 whitespace-nowrap">
                          {item.label}
                        </span>
                        <div
                          className={cn(
                            "ml-auto transform transition-transform duration-300",
                            state === "collapsed"
                              ? "translate-x-8 opacity-0"
                              : "translate-x-0 opacity-100"
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-all duration-300",
                              isActive
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-50"
                            )}
                          />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </div>
        <SidebarFooter className="p-3 border-t border-white/10 pt-3">
          <SidebarMenu>
            <SidebarMenuItem className="my-1">
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: "Settings",
                  className: "font-sans bg-gray-900 text-white py-1.5 px-3",
                }}
                className="justify-start gap-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 group"
              >
                <Link href="#">
                  <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="my-1">
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: "Logout",
                  className: "font-sans bg-gray-900 text-white py-1.5 px-3",
                }}
                className="justify-start gap-3 rounded-xl text-white/80 hover:text-white hover:bg-rose-500/20 transition-all duration-300 group"
              >
                <Link href="/signin">
                  <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* User Profile Section */}
          <div
            className={cn(
              "flex items-center gap-3 p-3 mt-4 rounded-xl bg-white/5 transition-all duration-500 overflow-hidden",
              state === "collapsed" ? "justify-center" : "justify-start"
            )}
          >
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                UN
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "transition-all duration-500 overflow-hidden",
                state === "collapsed" ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              <p className="text-sm font-medium text-white">User Name</p>
              <p className="text-xs text-white/60">admin@uvani.com</p>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}