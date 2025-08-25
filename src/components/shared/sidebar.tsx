
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
  ChevronRight
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
      <SidebarHeader className="h-20 items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <UvaniLogo className="h-10 w-10 text-accent" />
          <h1
            className={`font-headline text-2xl text-white transition-opacity duration-300 ${
              state === "collapsed" ? "opacity-0" : "opacity-100"
            }`}
          >
            Uvani
          </h1>
        </div>
        <div className="absolute right-0 top-6 hidden md:block">
            <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{
                  children: item.label,
                  className: "font-body",
                }}
                className="justify-start gap-4 font-body"
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

      <SidebarFooter className="p-4">
        <div
          className={`flex items-center overflow-hidden rounded-lg bg-sidebar-accent/50 p-3 transition-all duration-300 ${
            state === "collapsed" ? "w-12 justify-center" : "w-full justify-between"
          }`}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Tailor" data-ai-hint="portrait woman" />
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
          <div
            className={`flex-1 overflow-hidden transition-opacity duration-200 ${
              state === "collapsed" ? "hidden" : "ml-4"
            }`}
          >
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              Tiana
            </p>
            <p className="truncate text-xs text-sidebar-foreground">
              Pro Tailor
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              state === "collapsed" ? "hidden" : ""
            }`}
          >
            <Link href="/signin">
              <LogOut className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
