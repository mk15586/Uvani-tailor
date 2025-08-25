import { AppSidebar } from "@/components/shared/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen w-full lg:p-6 p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
