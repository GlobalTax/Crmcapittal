
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppWithShortcuts() {
  useKeyboardShortcuts();
  return <App />;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWithShortcuts />
  </React.StrictMode>
);
