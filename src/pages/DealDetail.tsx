
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Building2, User, Calendar, Euro, Phone, Mail, MapPin, FileText, Activity, Clock } from "lucide-react";
import { Deal } from "@/types/Deal";
import { useDeals } from "@/hooks/useDeals";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditDealDialog } from "@/components/deals/EditDealDialog";

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { deals, loading, updateDeal } = useDeals();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState(false);

  useEffect(() => {
    if (deals.length > 0 && id) {
      const foundDeal = deals.find(d => d.id === id);
      setDeal(foundDeal || null);
    }
  }, [deals, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Deal no encontrado</h2>
          <p className="text-gray-600 mt-2">El deal que buscas no existe o no tienes permisos para verlo.</p>
          <Link to="/deals">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Negocios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return "bg-gray-100 text-gray-800";
      case 'media': return "bg-yellow-100 text-yellow-800";
      case 'alta': return "bg-orange-100 text-orange-800";
      case 'urgente': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysInPipeline = (createdAt: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/deals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.deal_name}</h1>
            <p className="text-gray-600 capitalize">{deal.deal_type}</p>
          </div>
        </div>
        <Button onClick={() => setEditingDeal(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor del Deal</label>
                  <div className="flex items-center mt-1">
                    <Euro className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-lg font-semibold">{formatCurrency(deal.deal_value)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Prioridad</label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(deal.priority)} variant="outline">
                      {deal.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Etapa Actual</label>
                  <div className="mt-1">
                    {deal.stage ? (
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: deal.stage.color + '20', 
                          borderColor: deal.stage.color,
                          color: deal.stage.color 
                        }}
                      >
                        {deal.stage.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">Sin etapa</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Propietario</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{deal.deal_owner || 'Sin asignar'}</span>
                  </div>
                </div>
              </div>

              {deal.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Descripción</label>
                    <p className="mt-1 text-gray-700">{deal.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de la Empresa */}
          {deal.company_name && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre de la Empresa</label>
                    <p className="mt-1 font-medium">{deal.company_name}</p>
                  </div>
                  {deal.sector && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sector</label>
                      <p className="mt-1">{deal.sector}</p>
                    </div>
                  )}
                  {deal.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ubicación</label>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{deal.location}</span>
                      </div>
                    </div>
                  )}
                  {deal.employees && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Empleados</label>
                      <p className="mt-1">{deal.employees}</p>
                    </div>
                  )}
                </div>

                {(deal.revenue || deal.ebitda) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {deal.revenue && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ingresos</label>
                          <p className="mt-1 font-medium">{formatCurrency(deal.revenue)}</p>
                        </div>
                      )}
                      {deal.ebitda && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">EBITDA</label>
                          <p className="mt-1 font-medium">{formatCurrency(deal.ebitda)}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Derecho */}
        <div className="space-y-6">
          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contactos (1)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.contact ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{deal.contact.name}</p>
                    {deal.contact.position && (
                      <p className="text-sm text-gray-500">{deal.contact.position}</p>
                    )}
                  </div>
                  {deal.contact.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${deal.contact.email}`} className="text-blue-600 hover:underline">
                        {deal.contact.email}
                      </a>
                    </div>
                  )}
                  {deal.contact.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${deal.contact.phone}`} className="text-blue-600 hover:underline">
                        {deal.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (deal.contact_name || deal.contact_email || deal.contact_phone) ? (
                <div className="space-y-3">
                  {deal.contact_name && (
                    <div>
                      <p className="font-medium">{deal.contact_name}</p>
                      {deal.contact_role && (
                        <p className="text-sm text-gray-500">{deal.contact_role}</p>
                      )}
                    </div>
                  )}
                  {deal.contact_email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${deal.contact_email}`} className="text-blue-600 hover:underline">
                        {deal.contact_email}
                      </a>
                    </div>
                  )}
                  {deal.contact_phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${deal.contact_phone}`} className="text-blue-600 hover:underline">
                        {deal.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay contactos asociados</p>
              )}
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Deal creado</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(deal.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Última actualización</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(deal.updated_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas del Deal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Métricas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Días en pipeline</span>
                <span className="text-sm font-medium">{getDaysInPipeline(deal.created_at)} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Fecha de creación</span>
                <span className="text-sm font-medium">
                  {format(new Date(deal.created_at), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              {deal.close_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fecha de cierre</span>
                  <span className="text-sm font-medium">
                    {format(new Date(deal.close_date), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingDeal && (
        <EditDealDialog
          deal={deal}
          open={editingDeal}
          onOpenChange={setEditingDeal}
          onSuccess={async (updates) => {
            await updateDeal(deal.id, updates);
            setEditingDeal(false);
            // Actualizar el deal local
            setDeal({ ...deal, ...updates });
          }}
        />
      )}
    </div>
  );
};

export default DealDetail;
