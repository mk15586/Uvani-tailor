"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Box, Wallet, Ruler, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: Box, label: "Orders" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/measurements", icon: Ruler, label: "Measurements" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg border border-border md:hidden"
    >
      <ul className="flex items-center justify-between px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
