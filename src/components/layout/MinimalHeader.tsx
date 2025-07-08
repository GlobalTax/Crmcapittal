import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, Bell } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export function MinimalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { resetOnboarding } = useOnboarding();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b bg-white">
      <div className="text-lg font-semibold text-gray-700">Panel de Control</div>
      <div className="flex items-center gap-4">
        <div data-tour="notifications-center">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetOnboarding}
          title="Ver guía para nuevos usuarios"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        
        <button 
          onClick={handleSignOut}
          className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}