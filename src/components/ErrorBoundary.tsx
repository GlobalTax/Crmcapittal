
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ErrorBoundary caught an error
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Error en la aplicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página o contacta al administrador si el problema persiste.
            </p>
            <div className="bg-card border rounded-lg p-4">
              <details className="text-sm">
                <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error?.message}
                </pre>
              </details>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              Recargar página
            </Button>
            <Button 
              variant="secondary"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
