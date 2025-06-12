
import { useAuth } from "@/contexts/AuthContext";
import { useFavoriteOperations } from "@/hooks/useFavoriteOperations";
import { OperationCard } from "@/components/OperationCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, User } from "lucide-react";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const { favoriteOperations, loading } = useFavoriteOperations();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-6 w-6 mr-3 text-blue-600" />
              <h1 className="text-2xl font-bold text-black">Mi Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-black">Bienvenido, {user?.email}</p>
                <p className="text-xs text-gray-500">Gestiona tus oportunidades favoritas</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Cerrar Sesión
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-black hover:shadow-md transition-shadow mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Oportunidades Guardadas</p>
              <p className="text-2xl font-bold text-black">{favoriteOperations.length}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500 fill-current" />
          </div>
        </div>

        {/* Favorite Operations */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-black">Mis Oportunidades Favoritas</h2>
          
          {favoriteOperations.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border-black text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes oportunidades guardadas
              </h3>
              <p className="text-gray-500 mb-6">
                Explora el portfolio y guarda las oportunidades que te interesen
              </p>
              <Link to="/">
                <Button>
                  Explorar Oportunidades
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteOperations.map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
