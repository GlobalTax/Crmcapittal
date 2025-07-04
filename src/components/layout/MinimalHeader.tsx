import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function MinimalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b bg-white">
      <div className="text-lg font-semibold text-gray-700">Panel de Control</div>
      <div className="flex items-center gap-4">
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