import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RODItem } from '@/types/RODItem';
import { 
  Eye, 
  Download, 
  Send, 
  FileText, 
  TrendingUp, 
  Building, 
  MapPin,
  Mail,
  Star,
  Calendar,
  DollarSign
} from 'lucide-react';

interface RODPreviewPanelProps {
  selectedItems: RODItem[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export function RODPreviewPanel({
  selectedItems,
  onGenerate,
  isGenerating
}: RODPreviewPanelProps) {
  const operations = selectedItems.filter(item => item.type === 'operation');
  const leads = selectedItems.filter(item => item.type === 'lead');
  const totalValue = selectedItems.reduce((sum, item) => sum + (item.value || item.amount || 0), 0);
  const totalEbitda = selectedItems.reduce((sum, item) => sum + (item.ebitda || 0), 0);

  if (selectedItems.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vista Previa de ROD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay elementos seleccionados</h3>
            <p className="text-muted-foreground">
              Selecciona elementos de la lista para ver una vista previa de tu ROD
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vista Previa de ROD
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generar ROD
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Summary */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <h3 className="text-xl font-bold mb-2">Reporte de Oportunidades de Dealflow</h3>
          <p className="text-muted-foreground mb-4">
            {selectedItems.length} oportunidades seleccionadas
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">€{totalValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Valor Total</div>
            </div>
            {totalEbitda > 0 && (
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">€{totalEbitda.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">EBITDA Total</div>
              </div>
            )}
          </div>
        </div>

        {/* Operations Section */}
        {operations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-600" />
              <h4 className="text-lg font-semibold">Mandatos de Venta ({operations.length})</h4>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {operations.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg bg-background/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{index + 1}. {item.title}</h5>
                      <p className="text-xs text-muted-foreground">{item.company_name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.sector}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span>€{(item.value || item.amount || 0).toLocaleString()}</span>
                    </div>
                    {item.ebitda && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                        <span>€{item.ebitda.toLocaleString()}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Section */}
        {leads.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              <h4 className="text-lg font-semibold">Leads Potenciales ({leads.length})</h4>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {leads.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg bg-background/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{index + 1}. {item.title}</h5>
                      <p className="text-xs text-muted-foreground">{item.company_name}</p>
                    </div>
                    {item.lead_score && (
                      <Badge variant="outline" className="text-xs">
                        Score: {item.lead_score}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {item.value && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span>€{item.value.toLocaleString()}</span>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span>{item.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-muted text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Generado el {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}