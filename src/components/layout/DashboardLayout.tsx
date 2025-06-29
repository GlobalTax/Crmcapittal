
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { GlobalHeader } from "./GlobalHeader";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/30">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <GlobalHeader />
          <main className="flex-1 overflow-auto bg-gray-50/30">
            <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
