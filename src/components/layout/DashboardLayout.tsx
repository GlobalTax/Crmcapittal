
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { GlobalHeader } from "./GlobalHeader";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <div className="flex-1 overflow-auto bg-background">
          <main className="w-full max-w-none px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
