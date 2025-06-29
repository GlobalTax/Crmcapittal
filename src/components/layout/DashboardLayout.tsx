
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
          <div className="flex-1 overflow-auto bg-gray-50/30">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
