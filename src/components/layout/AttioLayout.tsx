import { Outlet } from 'react-router-dom';
import { AttioSidebar } from './AttioSidebar';
import { AttioTopbar } from './AttioTopbar';
import { useUiLayout } from '@/state/useUiLayout';

export function AttioLayout() {
  const { focusMode } = useUiLayout();
  return (
    <div className={`min-h-screen bg-neutral-0 grid ${focusMode ? 'grid-cols-[0px_1fr]' : 'grid-cols-[240px_1fr]'}`}>
      {/* Sidebar */}
      {!focusMode && <AttioSidebar />}
      
      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 min-h-0">
        {/* Topbar */}
        <AttioTopbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-6 min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}