import React, { Component, ReactNode } from 'react';

interface DndGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface DndGuardState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary to prevent @dnd-kit related errors from crashing the app
 * This ensures that useLayoutEffect and other DnD-related errors are contained
 */
export class DndGuard extends Component<DndGuardProps, DndGuardState> {
  constructor(props: DndGuardProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DndGuardState {
    // Check if this is a DnD-related error
    if (error.message.includes('useLayoutEffect') || 
        error.message.includes('dnd-kit') ||
        error.stack?.includes('@dnd-kit')) {
      return { hasError: true, error };
    }
    // Re-throw non-DnD errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[DndGuard] Caught DnD-related error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive">
            Error de arrastrar y soltar. Esta funcionalidad no está disponible en esta vista.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components that might have DnD functionality
 */
export function withDndGuard<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <DndGuard fallback={fallback}>
        <Component {...props} />
      </DndGuard>
    );
  };
}