
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
  Settings
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: Box, label: "Orders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/measurements", icon: Ruler, label: "Measurements" },
  { href: "/pricing-tool", icon: Wand2, label: "AI Pricing" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-sidebar-border transition-all duration-500 ease-in-out hidden md:block"
    >
      <SidebarHeader className="h-16 items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <UvaniLogo className="h-8 w-8 text-sidebar-primary" />
          <h1
            className={`font-semibold text-xl text-white transition-opacity duration-300 ${
              state === "collapsed" ? "opacity-0" : "opacity-100"
            }`}
          >
            Uvani
          </h1>
        </div>
        <div className="absolute right-0 top-5 hidden md:block">
            <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{
                  children: item.label,
                  className: "font-sans",
                }}
                className="justify-start gap-3"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: "Settings",
                  className: "font-sans",
                }}
                className="justify-start gap-3"
              >
                <Link href="#">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: "Logout",
                  className: "font-sans",
                }}
                className="justify-start gap-3"
              >
                <Link href="/signin">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
