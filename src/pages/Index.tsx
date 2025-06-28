
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OperationsList } from "@/components/OperationsList";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { MANavigationMenu } from "@/components/MANavigationMenu";
import { useOperations } from "@/hooks/useOperations";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { operations, loading, error } = useOperations();
  const { user, loading: authLoading } = useAuth();
  const [showMASection, setShowMASection] = useState(false);

  // Calculate stats from all operations
  const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
  const availableOperations = operations.filter(op => op.status === "available").length;
  const totalOperations = operations.length;

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: '0.5px solid black' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0" style={{ borderBottom: '0.5px solid #d1d5db' }}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-black">Capittal</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Portal de inversiones y oportunidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                      Mi Cuenta
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                      Área Profesional
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                      Crear Cuenta / Acceder
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                      Área Profesional
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Segunda fila: Descripción y acción principal */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 sm:py-6 space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Oportunidades de Inversión</h2>
              <p className="text-base sm:text-lg text-gray-700">Descubre las mejores operaciones disponibles para inversión</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Contacta directamente para más información detallada</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={() => setShowMASection(!showMASection)}
                variant={showMASection ? "default" : "outline"}
                className="mb-2 sm:mb-0"
              >
                {showMASection ? "Ver Operaciones" : "Analytics M&A"}
              </Button>
              <AddCompanyDialog />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white">
        {showMASection ? (
          /* M&A Analytics Section */
          <MANavigationMenu />
        ) : (
          <>
            {/* Stats Cards - Sin efectos hover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-5 rounded-[10px]" style={{ border: '0.5px solid black' }}>
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-xs sm:text-sm font-semibold text-black">Valor Total</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                      €{(totalValue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-600">Portfolio completo</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-[10px]" style={{ border: '0.5px solid black' }}>
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-xs sm:text-sm font-semibold text-black">Disponibles</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-black mb-1">{availableOperations}</p>
                    <p className="text-xs text-gray-600">Listas para inversión</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-[10px] sm:col-span-2 lg:col-span-1" style={{ border: '0.5px solid black' }}>
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-xs sm:text-sm font-semibold text-black">Total Operaciones</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-black mb-1">{totalOperations}</p>
                    <p className="text-xs text-gray-600">En el portfolio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations List with integrated filters */}
            <OperationsList />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo y descripción */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h3 className="text-lg font-bold text-black">Capittal</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Portal líder en oportunidades de inversión y adquisiciones empresariales.
              </p>
              <p className="text-xs text-gray-500">
                © 2025 Capittal. Todos los derechos reservados.
              </p>
            </div>

            {/* Enlaces legales */}
            <div className="col-span-1 md:col-span-1">
              <h4 className="text-sm font-semibold text-black mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/terms" className="hover:text-black transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-black transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-black transition-colors">
                    Aviso Legal
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-black transition-colors">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="col-span-1 md:col-span-1">
              <h4 className="text-sm font-semibold text-black mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>info@capittal.com</p>
                <p>+34 900 123 456</p>
                <p className="text-xs text-gray-500 mt-4">
                  Para más información sobre nuestros servicios o para añadir tu empresa al portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
