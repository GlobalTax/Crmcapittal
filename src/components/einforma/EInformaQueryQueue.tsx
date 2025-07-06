import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlayIcon, PauseIcon, RefreshCwIcon, PlusIcon, TrashIcon } from 'lucide-react';

interface QueueItem {
  id: string;
  companyName: string;
  nif: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'error';
  addedAt: string;
  estimatedCost: number;
}

export const EInformaQueryQueue = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: '1',
      companyName: 'ESTRAPEY FINANZA SL',
      nif: 'B12345678',
      priority: 'high',
      status: 'processing',
      addedAt: new Date().toISOString(),
      estimatedCost: 0.15
    },
    {
      id: '2',
      companyName: 'TECNOLOGÍA AVANZADA SA',
      nif: 'A87654321',
      priority: 'medium',
      status: 'pending',
      addedAt: new Date().toISOString(),
      estimatedCost: 0.15
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(true);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newNif, setNewNif] = useState('');

  const addToQueue = () => {
    if (!newCompanyName.trim() || !newNif.trim()) return;

    const newItem: QueueItem = {
      id: Date.now().toString(),
      companyName: newCompanyName,
      nif: newNif.toUpperCase(),
      priority: 'medium',
      status: 'pending',
      addedAt: new Date().toISOString(),
      estimatedCost: 0.15
    };

    setQueueItems(prev => [...prev, newItem]);
    setNewCompanyName('');
    setNewNif('');
  };

  const removeFromQueue = (id: string) => {
    setQueueItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'outline';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: QueueItem['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const completedItems = queueItems.filter(item => item.status === 'completed').length;
  const totalItems = queueItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Control del procesamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cola de Procesamiento eInforma
            <div className="flex items-center gap-2">
              <Button onClick={toggleProcessing} variant="outline" size="sm">
                {isProcessing ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {queueItems.length} elementos en cola • {completedItems} completados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso general</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Añadir nueva consulta */}
      <Card>
        <CardHeader>
          <CardTitle>Añadir a Cola</CardTitle>
          <CardDescription>
            Agregar nuevas empresas para enriquecer con eInforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre de la Empresa</label>
              <Input
                placeholder="Ej: ESTRAPEY FINANZA SL"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">NIF/CIF</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: B12345678"
                  value={newNif}
                  onChange={(e) => setNewNif(e.target.value)}
                />
                <Button onClick={addToQueue}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de elementos en cola */}
      <Card>
        <CardHeader>
          <CardTitle>Elementos en Cola</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.companyName}</h4>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>NIF: {item.nif}</span>
                    <span className="mx-2">•</span>
                    <span>Coste estimado: €{item.estimatedCost}</span>
                    <span className="mx-2">•</span>
                    <span>Añadido: {new Date(item.addedAt).toLocaleString('es-ES')}</span>
                  </div>
                  {item.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={65} className="w-full h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Procesando... 65% completado
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromQueue(item.id)}
                  disabled={item.status === 'processing'}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de la cola */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {queueItems.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {queueItems.filter(i => i.status === 'processing').length}
            </div>
            <p className="text-sm text-muted-foreground">Procesando</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {queueItems.filter(i => i.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};