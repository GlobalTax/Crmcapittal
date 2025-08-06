import { Outlet } from 'react-router-dom';
import { AttioSidebar } from './AttioSidebar';
import { AttioTopbar } from './AttioTopbar';

export function AttioLayout() {
  return (
    <div className="min-h-screen bg-neutral-0 grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <AttioSidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-w-0">
        {/* Topbar */}
        <AttioTopbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}