import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/minimal/Badge";
import { Negocio } from "@/types/Negocio";
import { Building2, Users, Euro, Calendar, User, MapPin, Briefcase } from "lucide-react";

interface NegocioDetailsDialogProps {
  negocio: Negocio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (negocio: Negocio) => void;
}

export const NegocioDetailsDialog = ({ negocio, open, onOpenChange, onEdit }: NegocioDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">{negocio.nombre_negocio}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Tipo de Negocio</label>
                <p className="text-sm">{negocio.tipo_negocio}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Prioridad</label>
                <div className="mt-1">
                  <Badge color={negocio.prioridad === 'alta' ? 'red' : negocio.prioridad === 'media' ? 'yellow' : 'gray'}>
                    {negocio.prioridad}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Etapa</label>
                <div className="mt-1">
                  <Badge color="blue">{negocio.stage?.name || 'Sin etapa'}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Valor del Negocio</label>
                <div className="flex items-center gap-1 text-sm">
                  <Euro className="h-4 w-4" />
                  {negocio.valor_negocio ? negocio.valor_negocio.toLocaleString() : 'No especificado'}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Propietario</label>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-4 w-4" />
                  {negocio.propietario_negocio || 'Sin asignar'}
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Fecha de Cierre</label>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {negocio.fecha_cierre ? new Date(negocio.fecha_cierre).toLocaleDateString('es-ES') : 'No especificada'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Company and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Empresa</label>
              {negocio.company ? (
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{negocio.company.name}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No especificada</p>
              )}
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Contacto</label>
              {negocio.contact ? (
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm">{negocio.contact.name}</p>
                    {negocio.contact.email && <p className="text-xs text-gray-500">{negocio.contact.email}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No especificado</p>
              )}
            </div>
          </div>
          
          {/* Financial Info */}
          {(negocio.ingresos || negocio.ebitda || negocio.multiplicador) && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Información Financiera</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {negocio.ingresos && (
                  <div>
                    <label className="text-xs text-gray-500">Ingresos</label>
                    <p className="text-sm">€{negocio.ingresos.toLocaleString()}</p>
                  </div>
                )}
                {negocio.ebitda && (
                  <div>
                    <label className="text-xs text-gray-500">EBITDA</label>
                    <p className="text-sm">€{negocio.ebitda.toLocaleString()}</p>
                  </div>
                )}
                {negocio.multiplicador && (
                  <div>
                    <label className="text-xs text-gray-500">Multiplicador</label>
                    <p className="text-sm">{negocio.multiplicador}x</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {negocio.sector && (
              <div>
                <label className="text-xs text-gray-500">Sector</label>
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase className="h-4 w-4" />
                  {negocio.sector}
                </div>
              </div>
            )}
            
            {negocio.ubicacion && (
              <div>
                <label className="text-xs text-gray-500">Ubicación</label>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  {negocio.ubicacion}
                </div>
              </div>
            )}
            
            {negocio.empleados && (
              <div>
                <label className="text-xs text-gray-500">Empleados</label>
                <p className="text-sm">{negocio.empleados}</p>
              </div>
            )}
            
            {negocio.fuente_lead && (
              <div>
                <label className="text-xs text-gray-500">Fuente del Lead</label>
                <p className="text-sm">{negocio.fuente_lead}</p>
              </div>
            )}
          </div>
          
          {/* Description and Notes */}
          {negocio.descripcion && (
            <div>
              <label className="text-xs text-gray-500">Descripción</label>
              <p className="text-sm mt-1">{negocio.descripcion}</p>
            </div>
          )}
          
          {negocio.notas && (
            <div>
              <label className="text-xs text-gray-500">Notas</label>
              <p className="text-sm mt-1">{negocio.notas}</p>
            </div>
          )}
          
          {negocio.proxima_actividad && (
            <div>
              <label className="text-xs text-gray-500">Próxima Actividad</label>
              <p className="text-sm mt-1">{negocio.proxima_actividad}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={() => {
                onEdit(negocio);
                onOpenChange(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Editar Negocio
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};