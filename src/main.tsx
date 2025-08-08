
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global React shim for libraries expecting a global React (e.g., some DnD bundles)
if (typeof globalThis !== 'undefined' && !(globalThis as any).React) {
  (globalThis as any).React = React;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
