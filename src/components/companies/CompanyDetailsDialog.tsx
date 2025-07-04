
import { Company } from "@/types/Company";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CompanyDetailsDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCompany: (company: Company) => void;
}

export const CompanyDetailsDialog = ({ 
  company, 
  open, 
  onOpenChange, 
  onEditCompany 
}: CompanyDetailsDialogProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      activa: { label: "Activa", color: "bg-green-100 text-green-800" },
      inactiva: { label: "Inactiva", color: "bg-gray-100 text-gray-800" },
      prospecto: { label: "Prospecto", color: "bg-blue-100 text-blue-800" },
      cliente: { label: "Cliente", color: "bg-purple-100 text-purple-800" },
      perdida: { label: "Perdida", color: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      prospect: { label: "Prospecto", color: "bg-blue-100 text-blue-800" },
      cliente: { label: "Cliente", color: "bg-green-100 text-green-800" },
      partner: { label: "Partner", color: "bg-purple-100 text-purple-800" },
      franquicia: { label: "Franquicia", color: "bg-orange-100 text-orange-800" },
      competidor: { label: "Competidor", color: "bg-red-100 text-red-800" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {company.name}
            </DialogTitle>
            <Button onClick={() => onEditCompany(company)} size="sm">
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(company.company_status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {getTypeBadge(company.company_type)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tamaño</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{company.company_size}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lead Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{company.lead_score || 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descripción */}
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{company.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <strong>Website:</strong>
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}

                {company.domain && (
                  <div className="flex items-center gap-2">
                    <strong>Dominio:</strong>
                    <span className="text-sm">{company.domain}</span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-2">
                    <strong>Teléfono:</strong>
                    <span className="text-sm">{company.phone}</span>
                  </div>
                )}

                {(company.city || company.country) && (
                  <div className="flex items-center gap-2">
                    <strong>Ubicación:</strong>
                    <span className="text-sm">
                      {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start gap-2">
                    <strong>Dirección:</strong>
                    <span className="text-sm">{company.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Comercial */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información Comercial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.industry && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Industria:</span>
                    <span className="text-sm">{company.industry}</span>
                  </div>
                )}

                {company.annual_revenue && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Ingresos Anuales:</span>
                    <span className="text-sm">{formatCurrency(company.annual_revenue)}</span>
                  </div>
                )}

                {company.founded_year && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Fundada:</span>
                    <span className="text-sm">{company.founded_year}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Empleados:</span>
                  <span className="text-sm">{company.company_size}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clasificaciones Especiales */}
          {(company.is_target_account || company.is_key_account || company.is_franquicia) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clasificaciones Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {company.is_target_account && (
                    <Badge className="bg-purple-100 text-purple-800">Target Account</Badge>
                  )}
                  {company.is_key_account && (
                    <Badge className="bg-orange-100 text-orange-800">Key Account</Badge>
                  )}
                  {company.is_franquicia && (
                    <Badge className="bg-green-100 text-green-800">Franquicia</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Redes Sociales */}
          {(company.linkedin_url || company.twitter_url || company.facebook_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {company.linkedin_url && (
                    <a 
                      href={company.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {company.twitter_url && (
                    <a 
                      href={company.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Twitter
                    </a>
                  )}
                  {company.facebook_url && (
                    <a 
                      href={company.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-800 hover:underline"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Información de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Creado:</span> {formatDate(company.created_at)}
                </div>
                <div>
                  <span className="font-medium">Actualizado:</span> {formatDate(company.updated_at)}
                </div>
                {company.last_activity_date && (
                  <div>
                    <span className="font-medium">Última actividad:</span> {formatDate(company.last_activity_date)}
                  </div>
                )}
                {company.last_contact_date && (
                  <div>
                    <span className="font-medium">Último contacto:</span> {formatDate(company.last_contact_date)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
