import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AttioSidebar } from './AttioSidebar';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/personal': 'Dashboard Personal',
  '/contactos': 'Contactos',
  '/empresas': 'Empresas',
  '/transacciones': 'Mandatos de Venta',
  '/reconversiones': 'Reconversiones',
  '/proposals': 'Propuestas',
  '/email': 'Email',
  '/calendar': 'Calendario',
};

export function MobileHeader() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';

  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Menu button */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <AttioSidebar />
          </SheetContent>
        </Sheet>

        {/* Center: Page title */}
        <h1 className="text-base font-semibold text-foreground truncate">
          {currentTitle}
        </h1>

        {/* Right: Search button */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}