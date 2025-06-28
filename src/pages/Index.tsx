
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OperationsList } from "@/components/OperationsList";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { useOperations } from "@/hooks/useOperations";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Target, TrendingUp, Building2 } from "lucide-react";

const Index = () => {
  const { operations, loading, error } = useOperations();
  const { user, loading: authLoading } = useAuth();

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-black">Capittal M&A</h1>
                <p className="text-xs sm:text-sm text-gray-600">CRM Especializado en Fusiones y Adquisiciones</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto">
                    Ir al Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto">
                    Acceder al Sistema
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Hero section */}
          <div className="py-8 sm:py-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Gestión Profesional de M&A
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-6">
              Plataforma especializada para la gestión de fusiones, adquisiciones y oportunidades de inversión
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Acceder al Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comenzar Ahora
                  </Button>
                </Link>
              )}
              <AddCompanyDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Portfolio en Números</h3>
            <p className="text-gray-600">Descubre las oportunidades disponibles</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                €{(totalValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-gray-600">Valor Total del Portfolio</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{availableOperations}</p>
              <p className="text-gray-600">Deals Disponibles</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{totalOperations}</p>
              <p className="text-gray-600">Total de Operaciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Operations Preview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Oportunidades Destacadas</h3>
            <p className="text-gray-600">Explora las mejores operaciones disponibles</p>
          </div>
          
          <OperationsList />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Capittal M&A</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Plataforma especializada en gestión de fusiones y adquisiciones empresariales.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 Capittal M&A. Todos los derechos reservados.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-white transition-colors">
                    Aviso Legal
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-white transition-colors">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>info@capittal-ma.com</p>
                <p>+34 900 123 456</p>
                <p className="text-xs text-gray-500 mt-4">
                  Para más información sobre nuestros servicios especializados en M&A.
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
