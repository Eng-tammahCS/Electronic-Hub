import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background rtl-layout" dir="rtl">
        <div className="flex-1 flex flex-col main-content">
          <AppHeader />
          <main className="flex-1 p-6 overflow-auto bg-grid-pattern-fade gradient-background">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        {/* Sidebar positioned on the right in RTL */}
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
}