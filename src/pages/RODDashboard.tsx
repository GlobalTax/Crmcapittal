import React, { useState } from 'react';
import { Plus, Calendar, Users, Download, Copy, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useRodLog } from '@/hooks/useRodLog';
import { useSubscribers } from '@/hooks/useSubscribers';
import { RodLog } from '@/types/RodLog';
import { useToast } from '@/hooks/use-toast';

export const RODDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rodLogs, isLoading } = useRodLog();
  const { subscribers } = useSubscribers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [selectedROD, setSelectedROD] = useState<RodLog | null>(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  const filteredRODs = rodLogs.filter(rod => 
    rod.deals.some((deal: any) => 
      deal.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPeriodFromDeals = (deals: any[]) => {
    if (!deals || deals.length === 0) return 'Sin período';
    const firstDeal = deals[0];
    if (firstDeal.period) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${months[firstDeal.period.month - 1]} ${firstDeal.period.year}`;
    }
    return 'Sin período';
  };

  const handleCreateNew = () => {
    // Clear any existing draft before creating new ROD
    localStorage.removeItem('rod-builder-draft');
    navigate('/rod/builder', { state: { isNew: true } });
  };

  const handleDuplicate = (rod: RodLog) => {
    navigate('/rod/builder', { state: { duplicateData: rod } });
  };

  const handleDownload = (rod: RodLog) => {
    setSelectedROD(rod);
    setShowSubscribers(true);
  };

  const handleConfirmDownload = () => {
    if (selectedSubscribers.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un suscriptor",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Descarga iniciada",
      description: `ROD enviada a ${selectedSubscribers.length} suscriptor(es)`,
    });
    
    setShowSubscribers(false);
    setSelectedROD(null);
    setSelectedSubscribers([]);
  };

  const subscribersBySegment = subscribers?.reduce((acc: any, sub: any) => {
    const segment = sub.segment || 'Sin segmento';
    if (!acc[segment]) acc[segment] = [];
    acc[segment].push(sub);
    return acc;
  }, {}) || {};

  if (showSubscribers && selectedROD) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Seleccionar Suscriptores
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                ROD: {getPeriodFromDeals(selectedROD.deals)} • {selectedROD.deals?.length || 0} oportunidades
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSubscribers(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmDownload}>
                Enviar a {selectedSubscribers.length} suscriptor(es)
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {Object.entries(subscribersBySegment).map(([segment, subs]: [string, any]) => (
              <Card key={segment}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{segment}</h3>
                    <Badge variant="secondary">{subs.length} suscriptores</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {subs.map((subscriber: any) => (
                      <label
                        key={subscriber.id}
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubscribers(prev => [...prev, subscriber.id]);
                            } else {
                              setSelectedSubscribers(prev => prev.filter(id => id !== subscriber.id));
                            }
                          }}
                          className="rounded border-input"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{subscriber.name}</p>
                          <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">ROD Dashboard</h1>
          <Button onClick={handleCreateNew} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Nueva ROD
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por empresa o sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* RODs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRODs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay RODs generadas</h3>
              <p className="text-muted-foreground mb-6">
                Comienza creando tu primer reporte de oportunidades
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera ROD
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRODs.map((rod) => (
              <Card key={rod.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        ROD {getPeriodFromDeals(rod.deals)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(rod.sent_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {rod.deals?.length || 0} ops
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Enviado a suscriptores</span>
                    </div>
                    {rod.deals?.slice(0, 2).map((deal: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{deal.companyName}</span>
                        {deal.sector && (
                          <span className="text-muted-foreground"> • {deal.sector}</span>
                        )}
                      </div>
                    ))}
                    {(rod.deals?.length || 0) > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{(rod.deals?.length || 0) - 2} más...
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDuplicate(rod)}
                      className="gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Duplicar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(rod)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RODDashboard;