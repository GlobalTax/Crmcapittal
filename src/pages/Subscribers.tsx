import { useState } from 'react';
// import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscribers } from '@/hooks/useSubscribers';
import { CreateSubscriberDialog } from '@/components/subscribers/CreateSubscriberDialog';
import { EditSubscriberDialog } from '@/components/subscribers/EditSubscriberDialog';
import { Subscriber } from '@/types/Subscriber';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Subscribers() {
  const { subscribers, isLoading, deleteSubscriber } = useSubscribers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [hideUnsubscribed, setHideUnsubscribed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique segments for filter
  const segments = Array.from(new Set(subscribers.map(s => s.segment))).filter(Boolean);

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    if (segmentFilter !== 'all' && subscriber.segment !== segmentFilter) return false;
    if (hideUnsubscribed && subscriber.unsubscribed) return false;
    if (searchTerm && !subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const columns: ColumnDef<Subscriber>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "segment",
      header: "Segmento",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("segment")}</Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Fecha Creación",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div>{date.toLocaleDateString('es-ES')}</div>;
      },
    },
    {
      accessorKey: "verified",
      header: "Verificado",
      cell: ({ row }) => (
        <Badge variant={row.getValue("verified") ? "default" : "secondary"}>
          {row.getValue("verified") ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "unsubscribed",
      header: "Desuscrito",
      cell: ({ row }) => (
        <Badge variant={row.getValue("unsubscribed") ? "destructive" : "default"}>
          {row.getValue("unsubscribed") ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscriber = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingSubscriber(subscriber)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteSubscriber(subscriber.id)}
                className="text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <div className="p-6">Cargando suscriptores...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-end">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Suscriptor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los segmentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los segmentos</SelectItem>
                {segments.map(segment => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hide-unsubscribed"
                checked={hideUnsubscribed}
                onCheckedChange={(checked) => setHideUnsubscribed(!!checked)}
              />
              <label
                htmlFor="hide-unsubscribed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ocultar desuscritos
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <div className="border rounded-lg">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Suscriptores ({filteredSubscribers.length})</h3>
            <div className="space-y-2">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{subscriber.email}</div>
                    <div className="text-sm text-muted-foreground">{subscriber.segment}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={subscriber.verified ? "default" : "secondary"}>
                      {subscriber.verified ? "Verificado" : "No verificado"}
                    </Badge>
                    <Button size="sm" onClick={() => setEditingSubscriber(subscriber)}>
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateSubscriberDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {editingSubscriber && (
        <EditSubscriberDialog
          subscriber={editingSubscriber}
          open={!!editingSubscriber}
          onOpenChange={(open) => !open && setEditingSubscriber(null)}
        />
      )}
    </div>
  );
}