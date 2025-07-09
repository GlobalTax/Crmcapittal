import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit
} from 'lucide-react';
import { useContactHistory, ContactHistoryEntry } from '@/hooks/useContactHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactHistorySectionProps {
  targetId: string;
}

export const ContactHistorySection = ({ targetId }: ContactHistorySectionProps) => {
  const [contactHistory, setContactHistory] = useState<ContactHistoryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<ContactHistoryEntry | null>(null);
  const [newResult, setNewResult] = useState<'pendiente' | 'positivo' | 'negativo'>('pendiente');
  
  const { getContactHistory, updateContactResult, loading } = useContactHistory();

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getContactHistory(targetId);
      setContactHistory(history);
    };
    
    loadHistory();
  }, [targetId, getContactHistory]);

  const handleUpdateResult = async (entryId: string) => {
    const success = await updateContactResult(entryId, newResult);
    
    if (success) {
      // Refresh the history
      const updatedHistory = await getContactHistory(targetId);
      setContactHistory(updatedHistory);
      setEditingEntry(null);
    }
  };

  const getMedioIcon = (medio: string) => {
    return medio === 'email' ? Mail : Phone;
  };

  const getResultadoBadge = (resultado: string) => {
    const variants = {
      pendiente: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' },
      positivo: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      negativo: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    
    const config = variants[resultado as keyof typeof variants] || variants.pendiente;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className={`h-3 w-3 ${config.color}`} />
        {resultado.charAt(0).toUpperCase() + resultado.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (contactHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Contactos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No hay contactos registrados para este target
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Contactos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contactHistory.map((entry) => {
            const MedioIcon = getMedioIcon(entry.medio);
            
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <MedioIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Contacto por {entry.medio === 'email' ? 'email' : 'teléfono'}
                      </span>
                      {getResultadoBadge(entry.resultado)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.fecha_contacto)}
                    </p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingEntry(entry);
                        setNewResult(entry.resultado);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Actualizar Resultado del Contacto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Contacto por {entry.medio === 'email' ? 'email' : 'teléfono'} 
                          realizado el {formatDate(entry.fecha_contacto)}
                        </p>
                        
                        <Select value={newResult} onValueChange={(value: any) => setNewResult(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="positivo">Positivo</SelectItem>
                            <SelectItem value="negativo">Negativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        onClick={() => handleUpdateResult(entry.id)}
                        disabled={loading}
                        className="w-full"
                      >
                        Actualizar Resultado
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};