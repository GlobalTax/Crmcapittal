import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // G + S for Settings
      if (event.key === 's' && event.target === document.body) {
        const lastKey = (window as any).lastKeyPressed;
        if (lastKey === 'g') {
          event.preventDefault();
          navigate('/settings');
          (window as any).lastKeyPressed = null;
          return;
        }
      }

      // Store last key for combo detection
      if (event.target === document.body) {
        (window as any).lastKeyPressed = event.key.toLowerCase();
        setTimeout(() => {
          (window as any).lastKeyPressed = null;
        }, 1000);
      }

      // Ctrl/Cmd + F for search focus (only in settings)
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        if (window.location.pathname.startsWith('/settings')) {
          event.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Search settings"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};