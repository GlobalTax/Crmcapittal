
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { GlobalHeader } from "./GlobalHeader";

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-white">
          <GlobalHeader />
          <div className="flex-1 overflow-auto bg-white">
            <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
