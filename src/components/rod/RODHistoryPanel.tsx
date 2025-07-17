import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Calendar, 
  FileText, 
  Eye, 
  Copy, 
  Download,
  ArrowLeft,
  Users,
  Filter
} from 'lucide-react';
import { useRodLog } from '@/hooks/useRodLog';
import { useSubscribers } from '@/hooks/useSubscribers';
import { RodLog } from '@/types/RodLog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface RODHistoryPanelProps {
  onClose: () => void;
  onDuplicate?: (rodData: RodLog) => void;
}

export function RODHistoryPanel({ onClose, onDuplicate }: RODHistoryPanelProps) {
  const { rodLogs, isLoading, refetch } = useRodLog();
  const { subscribers } = useSubscribers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedROD, setSelectedROD] = useState<RodLog | null>(null);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

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

  const handleDownload = async (rod: RodLog) => {
    try {
      if (selectedSubscribers.length === 0) {
        toast.error('Selecciona al menos un destinatario para descargar');
        return;
      }
      
      // Simulamos la descarga - aquí conectarías con tu API
      toast.success('Descarga iniciada');
      console.log('Descargando ROD:', rod.id, 'para:', selectedSubscribers);
    } catch (error) {
      toast.error('Error al descargar la ROD');
    }
  };

  const subscribersBySegment = subscribers?.reduce((acc, sub) => {
    if (!acc[sub.segment]) acc[sub.segment] = [];
    acc[sub.segment].push(sub);
    return acc;
  }, {} as Record<string, typeof subscribers>) || {};

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

  // Vista de suscriptores
  if (showSubscribers) {
    return (
      <div className="w-full h-full flex flex-col bg-background">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSubscribers(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Destinatarios de la ROD</h2>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {selectedSubscribers.length} seleccionados
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {Object.entries(subscribersBySegment).map(([segment, segmentSubscribers]) => (
              <div key={segment} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {segment}
                </h3>
                <div className="space-y-2">
                  {segmentSubscribers.map((subscriber) => (
                    <div 
                      key={subscriber.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSubscribers(prev => [...prev, subscriber.id]);
                          } else {
                            setSelectedSubscribers(prev => prev.filter(id => id !== subscriber.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{subscriber.email}</p>
                      </div>
                      {!subscriber.verified && (
                        <Badge variant="secondary" className="text-xs">
                          No verificado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <Button 
            className="w-full" 
            onClick={() => setShowSubscribers(false)}
            disabled={selectedSubscribers.length === 0}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium">Histórico de RODs</h2>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-muted/50"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : filteredRODs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No se encontraron RODs' : 'Sin RODs generadas'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRODs.map((rod) => (
              <div key={rod.id} className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getPeriodFromDeals(rod.deals)}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {rod.deals?.length || 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rod.sent_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleViewDetails(rod)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDuplicate(rod)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowSubscribers(true)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}