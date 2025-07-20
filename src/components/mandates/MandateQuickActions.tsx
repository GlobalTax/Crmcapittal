
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Mail, 
  Phone, 
  FileText, 
  Calendar,
  Download,
  Users,
  MessageSquare
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface MandateQuickActionsProps {
  mandate: BuyingMandate;
  onAddTarget?: () => void;
  onBulkContact?: () => void;
  onScheduleFollowup?: () => void;
  onExportData?: () => void;
}

export const MandateQuickActions = ({ 
  mandate,
  onAddTarget,
  onBulkContact,
  onScheduleFollowup,
  onExportData
}: MandateQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onAddTarget}
            className="h-auto p-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Nuevo Target</span>
          </Button>

          <Button 
            onClick={onBulkContact}
            className="h-auto p-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Mail className="h-5 w-5" />
            <span className="text-sm">Contacto Masivo</span>
          </Button>

          <Button 
            onClick={onScheduleFollowup}
            className="h-auto p-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Programar Seguimiento</span>
          </Button>

          <Button 
            onClick={onExportData}
            className="h-auto p-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Download className="h-5 w-5" />
            <span className="text-sm">Exportar Datos</span>
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">Contacto Directo</h4>
          <div className="space-y-2">
            {mandate.client_email && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open(`mailto:${mandate.client_email}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                {mandate.client_email}
              </Button>
            )}
            {mandate.client_phone && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open(`tel:${mandate.client_phone}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                {mandate.client_phone}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
