import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Calendar, 
  FileText, 
  Eye, 
  Copy, 
  Download,
  ArrowLeft 
} from 'lucide-react';
import { useRodLog } from '@/hooks/useRodLog';
import { RodLog } from '@/types/RodLog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RODHistoryPanelProps {
  onClose: () => void;
  onDuplicate?: (rodData: RodLog) => void;
}

export function RODHistoryPanel({ onClose, onDuplicate }: RODHistoryPanelProps) {
  const { rodLogs, isLoading, refetch } = useRodLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedROD, setSelectedROD] = useState<RodLog | null>(null);

  const filteredRODs = rodLogs.filter(rod => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const period = rod.deals?.[0]?.period || '';
    const dealsText = rod.deals?.map(d => d.title || d.company_name).join(' ') || '';
    
    return period.toLowerCase().includes(searchLower) ||
           dealsText.toLowerCase().includes(searchLower);
  });

  const handleViewDetails = (rod: RodLog) => {
    setSelectedROD(rod);
  };

  const handleDuplicate = (rod: RodLog) => {
    onDuplicate?.(rod);
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getPeriodFromDeals = (deals: any[]) => {
    if (!deals || deals.length === 0) return 'Período no especificado';
    const firstDeal = deals[0];
    return firstDeal.period || 'Sin período';
  };

  if (selectedROD) {
    return (
      <Card className="w-full h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedROD(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">Detalles de ROD</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDuplicate(selectedROD)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Información general */}
            <div>
              <h3 className="text-lg font-medium mb-3">Información General</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Período:</span>
                  <p className="text-muted-foreground">{getPeriodFromDeals(selectedROD.deals)}</p>
                </div>
                <div>
                  <span className="font-medium">Fecha de envío:</span>
                  <p className="text-muted-foreground">{formatDate(selectedROD.sent_at)}</p>
                </div>
                <div>
                  <span className="font-medium">Total de elementos:</span>
                  <p className="text-muted-foreground">{selectedROD.deals?.length || 0}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lista de deals/leads */}
            <div>
              <h3 className="text-lg font-medium mb-3">Contenido de la ROD</h3>
              <div className="space-y-3">
                {selectedROD.deals?.map((deal, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{deal.title || deal.company_name || 'Sin título'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {deal.sector && `Sector: ${deal.sector}`}
                          {deal.value && ` • Valor: €${deal.value.toLocaleString()}`}
                          {deal.ebitda && ` • EBITDA: €${deal.ebitda.toLocaleString()}`}
                        </p>
                        {deal.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {deal.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={deal.highlighted ? 'default' : 'secondary'}>
                        {deal.type === 'operation' ? 'Operación' : 'Lead'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de RODs
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por período o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando histórico...</p>
            </div>
          </div>
        ) : filteredRODs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No se encontraron RODs' : 'Aún no hay RODs generadas'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRODs.map((rod) => (
              <Card key={rod.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getPeriodFromDeals(rod.deals)}</span>
                      <Badge variant="outline">
                        {rod.deals?.length || 0} elementos
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enviado: {formatDate(rod.sent_at)}
                    </p>
                    {rod.deals && rod.deals.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Incluye: {rod.deals.slice(0, 2).map(d => d.title || d.company_name).join(', ')}
                        {rod.deals.length > 2 && ` y ${rod.deals.length - 2} más...`}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(rod)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDuplicate(rod)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}