import { Outlet } from 'react-router-dom';
import { MinimalSidebar } from './MinimalSidebar';
import { MinimalHeader } from './MinimalHeader';
import { OnboardingProvider } from '../onboarding/OnboardingProvider';

export function MinimalLayout() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background flex">
        <MinimalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MinimalHeader />
          <main className="flex-1 p-6 lg:p-8 bg-background overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}