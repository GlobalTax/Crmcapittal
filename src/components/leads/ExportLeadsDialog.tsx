import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, LeadStatus } from "@/types/Lead";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExportLeadsDialogProps {
  leads: Lead[];
}

type ExportFormat = 'csv' | 'excel' | 'json';

export const ExportLeadsDialog = ({ leads }: ExportLeadsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [includeFields, setIncludeFields] = useState({
    basicInfo: true,
    contactInfo: true,
    companyInfo: true,
    metrics: true,
    engagement: true,
    timestamps: true
  });

  const handleFieldChange = (field: keyof typeof includeFields, checked: boolean) => {
    setIncludeFields(prev => ({ ...prev, [field]: checked }));
  };

  const getFilteredLeads = () => {
    if (statusFilter === 'all') return leads;
    return leads.filter(lead => lead.status === statusFilter);
  };

  const exportToCSV = (data: Lead[]) => {
    const headers = [];
    const rows = [];

    // Build headers based on selected fields
    if (includeFields.basicInfo) {
      headers.push('Nombre', 'Estado', 'Fuente', 'Prioridad', 'Calidad');
    }
    if (includeFields.contactInfo) {
      headers.push('Email', 'Teléfono', 'Cargo');
    }
    if (includeFields.companyInfo) {
      headers.push('Empresa');
    }
    if (includeFields.metrics) {
      headers.push('Lead Score', 'Seguimientos');
    }
    if (includeFields.engagement) {
      headers.push('Aperturas Email', 'Clicks Email', 'Visitas Web', 'Descargas');
    }
    if (includeFields.timestamps) {
      headers.push('Fecha Creación', 'Última Actualización');
    }
    if (includeFields.basicInfo) {
      headers.push('Asignado a', 'Mensaje');
    }

    // Build rows
    data.forEach(lead => {
      const row = [];
      
      if (includeFields.basicInfo) {
        row.push(lead.name, lead.status, lead.source, lead.priority || 'MEDIUM', lead.quality || 'FAIR');
      }
      if (includeFields.contactInfo) {
        row.push(lead.email, lead.phone || '', lead.job_title || '');
      }
      if (includeFields.companyInfo) {
        row.push(lead.company_name || '');
      }
      if (includeFields.metrics) {
        row.push(lead.lead_score || 0, lead.follow_up_count || 0);
      }
      if (includeFields.engagement) {
        row.push(
          lead.email_opens || 0,
          lead.email_clicks || 0,
          lead.website_visits || 0,
          lead.content_downloads || 0
        );
      }
      if (includeFields.timestamps) {
        row.push(
          new Date(lead.created_at).toLocaleDateString(),
          new Date(lead.updated_at).toLocaleDateString()
        );
      }
      if (includeFields.basicInfo) {
        row.push(
          lead.assigned_to ? `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}` : '',
          lead.message || ''
        );
      }
      
      rows.push(row);
    });

    // Create CSV content
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = (data: Lead[]) => {
    const exportData = data.map(lead => {
      const exportLead: any = {};
      
      if (includeFields.basicInfo) {
        exportLead.name = lead.name;
        exportLead.status = lead.status;
        exportLead.source = lead.source;
        exportLead.priority = lead.priority;
        exportLead.quality = lead.quality;
        exportLead.message = lead.message;
      }
      if (includeFields.contactInfo) {
        exportLead.email = lead.email;
        exportLead.phone = lead.phone;
        exportLead.job_title = lead.job_title;
      }
      if (includeFields.companyInfo) {
        exportLead.company_name = lead.company_name;
      }
      if (includeFields.metrics) {
        exportLead.lead_score = lead.lead_score;
        exportLead.follow_up_count = lead.follow_up_count;
      }
      if (includeFields.engagement) {
        exportLead.email_opens = lead.email_opens;
        exportLead.email_clicks = lead.email_clicks;
        exportLead.website_visits = lead.website_visits;
        exportLead.content_downloads = lead.content_downloads;
      }
      if (includeFields.timestamps) {
        exportLead.created_at = lead.created_at;
        exportLead.updated_at = lead.updated_at;
      }
      if (includeFields.basicInfo && lead.assigned_to) {
        exportLead.assigned_to = {
          first_name: lead.assigned_to.first_name,
          last_name: lead.assigned_to.last_name
        };
      }
      
      return exportLead;
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExport = () => {
    const filteredLeads = getFilteredLeads();
    
    if (filteredLeads.length === 0) {
      toast.error('No hay leads para exportar con los filtros seleccionados');
      return;
    }

    try {
      switch (format) {
        case 'csv':
          exportToCSV(filteredLeads);
          break;
        case 'json':
          exportToJSON(filteredLeads);
          break;
        default:
          toast.error('Formato de exportación no soportado');
          return;
      }
      
      toast.success(`${filteredLeads.length} leads exportados exitosamente`);
      setOpen(false);
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Error al exportar los leads');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Leads</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Formato de exportación</Label>
            <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Filtrar por estado</Label>
            <Select value={statusFilter} onValueChange={(value: LeadStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="CONTACTED">Contactado</SelectItem>
                <SelectItem value="QUALIFIED">Calificado</SelectItem>
                <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                <SelectItem value="NURTURING">Nutriendo</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Campos a incluir</Label>
            <div className="space-y-2 mt-2">
              {Object.entries({
                basicInfo: 'Información básica',
                contactInfo: 'Información de contacto',
                companyInfo: 'Información de empresa',
                metrics: 'Métricas de lead',
                engagement: 'Engagement',
                timestamps: 'Fechas'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={includeFields[key as keyof typeof includeFields]}
                    onCheckedChange={(checked) => handleFieldChange(key as keyof typeof includeFields, checked as boolean)}
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Se exportarán {getFilteredLeads().length} leads
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport}>
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};