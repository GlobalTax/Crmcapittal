import { Outlet } from 'react-router-dom';
import { MinimalSidebar } from './MinimalSidebar';
import { MinimalHeader } from './MinimalHeader';

export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MinimalSidebar />
      <div className="flex-1 flex flex-col">
        <MinimalHeader />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}