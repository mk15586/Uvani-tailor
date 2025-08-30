"use client";

import { usePathname } from 'next/navigation';
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
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCurrentPage = () => {
    const currentNavItem = navItems.find((item) => pathname.startsWith(item.href));
    return currentNavItem
      ? { label: currentNavItem.label, icon: currentNavItem.icon }
      : { label: 'Uvani', icon: UvaniLogo };
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 px-4 lg:px-6 flex items-center",
      isScrolled && "shadow-md h-14"
    )}>
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Current Page Name and Icon */}
        <div className="flex items-center gap-3 min-w-0">
          {(() => {
            const { label, icon: Icon } = getCurrentPage();
            return (
              <>
                <Icon className="h-7 w-7 text-primary shrink-0" />
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">{label}</span>
              </>
            );
          })()}
        </div>

        {/* Center: Search Bar */}
        <div className={cn(
          "flex-1 flex justify-center",
          searchOpen ? "max-w-xl" : "max-w-md"
        )}>
          <div className="relative w-full max-w-lg">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-opacity" />
              <Input
                type="search"
                placeholder="Search orders, customers, products..."
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              3
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold">
                  JD
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@uvani.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-accent/50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer transition-colors focus:bg-accent/50">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
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