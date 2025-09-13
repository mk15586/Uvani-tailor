"use client";

import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/shared/header";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const pathname = usePathname();

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
