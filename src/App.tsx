import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityHeaders } from '@/components/security/SecurityHeaders';
import { AppRoutes } from '@/AppRoutes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <SecurityHeaders>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              <AppRoutes />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </SecurityHeaders>
  );
}

export default App;
