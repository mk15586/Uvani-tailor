"use client";

import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/shared/header";
import { cn } from "@/lib/utils";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div className="grid min-h-screen w-full">
      <div className="flex">
        <AppSidebar />
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-500 ease-in-out",
            state === "expanded"
              ? "md:ml-[220px] lg:ml-[280px]"
              : "md:ml-[68px]"
          )}
        >
          <AppHeader />
          {children}
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
