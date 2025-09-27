import { Outlet } from 'react-router-dom';
import { AttioSidebar } from './AttioSidebar';
import { AttioTopbar } from './AttioTopbar';
import { useUiLayout } from '@/state/useUiLayout';

export function AttioLayout() {
  const { focusMode } = useUiLayout();
  return (
    <div className={`h-screen bg-neutral-0 grid ${focusMode ? 'grid-cols-[0px_1fr]' : 'grid-cols-[240px_1fr]'}`}>
      {/* Sidebar */}
      {!focusMode && <AttioSidebar />}
      
      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 h-full relative z-10">
        {/* Topbar */}
        <AttioTopbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}