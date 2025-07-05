import { useState } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

let toastCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default', duration = 2000 }: ToastOptions) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = { id, title, description, variant, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  };

  const dismiss = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  return {
    toast,
    dismiss,
    toasts
  };
};

// Global toast function
let globalToast: ReturnType<typeof useToast>['toast'] | null = null;

export const setGlobalToast = (toastFn: ReturnType<typeof useToast>['toast']) => {
  globalToast = toastFn;
};

export const toast = (options: ToastOptions) => {
  if (globalToast) {
    return globalToast(options);
  }
  console.warn('Toast not initialized');
};