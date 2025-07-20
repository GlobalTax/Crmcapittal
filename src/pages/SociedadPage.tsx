
import { useParams, useNavigate } from "react-router-dom";
import { useSociedad } from "@/hooks/useSociedad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Globe, MapPin, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const SociedadPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log("🏢 [SociedadPage] Componente iniciado con ID:", id);

  const { data: sociedad, isLoading, error } = useSociedad(id!);

  console.log("📊 [SociedadPage] Estado de datos:", {
    hasData: !!sociedad,
    isLoading,
    error: error?.message,
    sociedadName: sociedad?.name
  });

  const handleBack = () => {
    console.log("⬅️ [SociedadPage] Volviendo a listado");
    navigate("/sociedades");
  };

  if (isLoading) {
    console.log("⏳ [SociedadPage] Mostrando estado de carga");
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ [SociedadPage] Error cargando datos:", error);
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar la sociedad</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  if (!sociedad) {
    console.warn("⚠️ [SociedadPage] No se encontraron datos de sociedad");
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sociedad no encontrada</h2>
          <p className="text-muted-foreground mb-4">La sociedad que buscas no existe o no tienes permisos para verla.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ [SociedadPage] Renderizando datos de sociedad:", sociedad.name);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'activa': { variant: 'default', label: 'Activa' },
      'inactiva': { variant: 'secondary', label: 'Inactiva' },
      'prospecto': { variant: 'outline', label: 'Prospecto' },
      'cliente': { variant: 'default', label: 'Cliente' },
      'perdida': { variant: 'destructive', label: 'Perdida' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'prospect': { variant: 'outline', label: 'Prospecto' },
      'cliente': { variant: 'default', label: 'Cliente' },
      'partner': { variant: 'secondary', label: 'Partner' },
      'franquicia': { variant: 'default', label: 'Franquicia' },
      'competidor': { variant: 'destructive', label: 'Competidor' },
      'target': { variant: 'default', label: 'Target' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'outline', label: type };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{sociedad.name}</h1>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(sociedad.company_status)}
            {getTypeBadge(sociedad.company_type)}
          </div>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Información de contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sociedad.domain && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{sociedad.domain}</span>
              </div>
            )}
            {sociedad.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={sociedad.website} target="_blank" rel="noopener noreferrer" 
                   className="text-sm text-blue-600 hover:underline">
                  {sociedad.website}
                </a>
              </div>
            )}
            {sociedad.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{sociedad.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sociedad.address && (
              <div className="text-sm">
                <span className="text-muted-foreground">Dirección:</span>
                <p>{sociedad.address}</p>
              </div>
            )}
            {sociedad.city && (
              <div className="text-sm">
                <span className="text-muted-foreground">Ciudad:</span>
                <p>{sociedad.city}</p>
              </div>
            )}
            {sociedad.country && (
              <div className="text-sm">
                <span className="text-muted-foreground">País:</span>
                <p>{sociedad.country}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información financiera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Información Financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sociedad.annual_revenue && (
              <div className="text-sm">
                <span className="text-muted-foreground">Facturación anual:</span>
                <p className="font-medium">{sociedad.annual_revenue.toLocaleString()}€</p>
              </div>
            )}
            {sociedad.founded_year && (
              <div className="text-sm">
                <span className="text-muted-foreground">Año de fundación:</span>
                <p>{sociedad.founded_year}</p>
              </div>
            )}
            {sociedad.nif && (
              <div className="text-sm">
                <span className="text-muted-foreground">NIF:</span>
                <p>{sociedad.nif}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del sector */}
        <Card>
          <CardHeader>
            <CardTitle>Sector y Tamaño</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sociedad.industry && (
              <div className="text-sm">
                <span className="text-muted-foreground">Sector:</span>
                <p>{sociedad.industry}</p>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Tamaño:</span>
              <p>{sociedad.company_size} empleados</p>
            </div>
          </CardContent>
        </Card>

        {/* Fechas importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Creado:</span>
              <p>{format(new Date(sociedad.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Actualizado:</span>
              <p>{format(new Date(sociedad.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Descripción */}
        {sociedad.description && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{sociedad.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SociedadPage;
