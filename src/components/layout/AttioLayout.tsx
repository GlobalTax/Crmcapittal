import { Outlet } from 'react-router-dom';
import { AttioSidebar } from './AttioSidebar';
import { AttioTopbar } from './AttioTopbar';
import { useUiLayout } from '@/state/useUiLayout';

export function AttioLayout() {
  const { focusMode } = useUiLayout();
  return (
    <div 
      className={`min-h-[100dvh] h-full bg-neutral-0 grid ${focusMode ? 'grid-cols-[0px_1fr] focus-mode' : 'grid-cols-[240px_1fr]'}`}
      style={{
        '--sidebar-width': focusMode ? '0px' : '240px',
        '--topbar-height': '64px'
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      {!focusMode && <AttioSidebar />}
      
      {/* Main Content Area */}
      <div className="flex flex-col min-w-0 min-h-0 h-full relative z-10">
        {/* Topbar */}
        <AttioTopbar />
        
        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}