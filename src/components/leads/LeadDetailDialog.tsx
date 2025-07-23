import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@/types/Lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  Target,
  Tag,
  MessageSquare,
  ExternalLink
} from "lucide-react";

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
};

const qualityColors = {
  POOR: 'bg-red-100 text-red-800',
  FAIR: 'bg-yellow-100 text-yellow-800',
  GOOD: 'bg-green-100 text-green-800',
  EXCELLENT: 'bg-emerald-100 text-emerald-800'
};

export const LeadDetailDialog = ({ open, onOpenChange, lead }: LeadDetailDialogProps) => {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{lead.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                      {lead.phone}
                    </a>
                  </div>
                )}
              </div>

              {lead.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{lead.company}</span>
                </div>
              )}

              {lead.position && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{lead.position}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Creado el {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium">Estado: </span>
                <LeadStatusBadge status={lead.status} />
              </div>

              <div>
                <span className="text-sm font-medium">Fuente: </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {lead.source.replace('_', ' ')}
                </Badge>
              </div>

              {lead.assigned_to && (
                <div>
                  <span className="text-sm font-medium">Asignado a: </span>
                  <span className="text-sm">
                    {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Métricas y calidad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{lead.lead_score}</span>
              </div>
              <span className="text-xs text-gray-600">Lead Score</span>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Badge 
                variant="outline" 
                className={`text-xs ${priorityColors[lead.priority || 'MEDIUM']}`}
              >
                {lead.priority || 'MEDIUM'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">Prioridad</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Badge 
                variant="outline" 
                className={`text-xs ${qualityColors[lead.quality || 'FAIR']}`}
              >
                {lead.quality || 'FAIR'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">Calidad</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">{lead.follow_up_count || 0}</div>
              <span className="text-xs text-gray-600">Seguimientos</span>
            </div>
          </div>

          {/* Estadísticas de engagement */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Engagement
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Aperturas de email:</span>
                <span className="font-medium">{lead.email_opens || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clicks de email:</span>
                <span className="font-medium">{lead.email_clicks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visitas web:</span>
                <span className="font-medium">{lead.website_visits || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descargas:</span>
                <span className="font-medium">{lead.content_downloads || 0}</span>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          {lead.message && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensaje inicial
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {lead.message}
              </div>
            </div>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Datos del formulario */}
          {lead.form_data && Object.keys(lead.form_data).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Datos adicionales</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <pre className="text-xs text-gray-700 overflow-auto">
                  {JSON.stringify(lead.form_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};