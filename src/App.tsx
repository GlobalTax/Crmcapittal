
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@/providers/AppProvider';
import { AppRoutes } from '@/AppRoutes';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
