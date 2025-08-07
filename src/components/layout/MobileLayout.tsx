import { Outlet } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNavigation } from './MobileBottomNavigation';

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
}