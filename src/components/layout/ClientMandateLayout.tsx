import { ReactNode } from 'react';

interface ClientMandateLayoutProps {
  children: ReactNode;
  mandateName?: string;
}

export function ClientMandateLayout({ children, mandateName }: ClientMandateLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-semibold text-foreground">
                Portal Cliente
              </div>
              {mandateName && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="text-sm text-muted-foreground">
                    {mandateName}
                  </div>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Vista de solo lectura
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-xs text-muted-foreground">
            Portal de acceso para cliente • Vista restringida
          </div>
        </div>
      </footer>
    </div>
  );
}