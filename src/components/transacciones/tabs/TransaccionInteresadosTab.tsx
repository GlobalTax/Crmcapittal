import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Phone, Building2, User, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactionInterested, TransactionInterestedParty } from '@/hooks/useTransactionInterested';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

interface TransaccionInteresadosTabProps {
  transaccionId: string;
}

const getInterestLevelBadge = (level: string) => {
  const config = {
    initial: { label: 'Inicial', variant: 'secondary' as const },
    low: { label: 'Bajo', variant: 'outline' as const },
    medium: { label: 'Medio', variant: 'default' as const },
    high: { label: 'Alto', variant: 'default' as const },
    very_high: { label: 'Muy Alto', variant: 'destructive' as const },
  };
  
  const { label, variant } = config[level as keyof typeof config] || config.initial;
  return <Badge variant={variant}>{label}</Badge>;
};

const getProcessStatusBadge = (status: string) => {
  const config = {
    initial: { label: 'Inicial', variant: 'secondary' as const },
    teaser_sent: { label: 'Teaser Enviado', variant: 'outline' as const },
    nda_signed: { label: 'NDA Firmado', variant: 'default' as const },
    due_diligence: { label: 'Due Diligence', variant: 'default' as const },
    offer_submitted: { label: 'Oferta Presentada', variant: 'destructive' as const },
    negotiation: { label: 'Negociación', variant: 'destructive' as const },
    closed_won: { label: 'Cerrado - Ganado', variant: 'default' as const },
    closed_lost: { label: 'Cerrado - Perdido', variant: 'outline' as const },
  };
  
  const { label, variant } = config[status as keyof typeof config] || config.initial;
  return <Badge variant={variant}>{label}</Badge>;
};

const InteresadoForm = ({ 
  interesado, 
  onSave, 
  onCancel,
  transactionId 
}: { 
  interesado?: TransactionInterestedParty;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  transactionId: string;
}) => {
  const [formData, setFormData] = useState({
    name: interesado?.name || '',
    email: interesado?.email || '',
    phone: interesado?.phone || '',
    company: interesado?.company || '',
    position: interesado?.position || '',
    interest_level: interesado?.interest_level || 'initial',
    process_status: interesado?.process_status || 'initial',
    financial_capacity: interesado?.financial_capacity || '',
    notes: interesado?.notes || '',
    transaction_id: transactionId,
    created_by: null,
    score: interesado?.score || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      financial_capacity: formData.financial_capacity ? parseFloat(formData.financial_capacity as string) : null
    };

    await onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="financial_capacity">Capacidad Financiera</Label>
          <Input
            id="financial_capacity"
            type="number"
            value={formData.financial_capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, financial_capacity: e.target.value }))}
            placeholder="Monto en euros"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="interest_level">Nivel de Interés</Label>
          <Select value={formData.interest_level} onValueChange={(value: 'initial' | 'low' | 'medium' | 'high' | 'very_high') => setFormData(prev => ({ ...prev, interest_level: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initial">Inicial</SelectItem>
              <SelectItem value="low">Bajo</SelectItem>
              <SelectItem value="medium">Medio</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="very_high">Muy Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="process_status">Estado del Proceso</Label>
          <Select value={formData.process_status} onValueChange={(value: 'initial' | 'teaser_sent' | 'nda_signed' | 'due_diligence' | 'offer_submitted' | 'negotiation' | 'closed_won' | 'closed_lost') => setFormData(prev => ({ ...prev, process_status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initial">Inicial</SelectItem>
              <SelectItem value="teaser_sent">Teaser Enviado</SelectItem>
              <SelectItem value="nda_signed">NDA Firmado</SelectItem>
              <SelectItem value="due_diligence">Due Diligence</SelectItem>
              <SelectItem value="offer_submitted">Oferta Presentada</SelectItem>
              <SelectItem value="negotiation">Negociación</SelectItem>
              <SelectItem value="closed_won">Cerrado - Ganado</SelectItem>
              <SelectItem value="closed_lost">Cerrado - Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {interesado ? 'Actualizar' : 'Crear'} Interesado
        </Button>
      </div>
    </form>
  );
};

export const TransaccionInteresadosTab = ({ transaccionId }: TransaccionInteresadosTabProps) => {
  const { interestedParties, isLoading, addInterestedParty, updateInterestedParty, deleteInterestedParty } = useTransactionInterested(transaccionId);
  const [selectedInteresado, setSelectedInteresado] = useState<TransactionInterestedParty | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (data: any) => {
    try {
      if (selectedInteresado) {
        await updateInterestedParty(selectedInteresado.id, data);
      } else {
        await addInterestedParty(data);
      }
      setIsDialogOpen(false);
      setSelectedInteresado(undefined);
    } catch (error) {
      console.error('Error saving interested party:', error);
    }
  };

  const handleEdit = (interesado: TransactionInterestedParty) => {
    setSelectedInteresado(interesado);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este interesado?')) {
      await deleteInterestedParty(id);
    }
  };

  const handleNewInteresado = () => {
    setSelectedInteresado(undefined);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Cargando interesados...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Partes Interesadas</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona los potenciales compradores y su progreso en el proceso de venta
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewInteresado}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Interesado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedInteresado ? 'Editar Interesado' : 'Nuevo Interesado'}
              </DialogTitle>
            </DialogHeader>
            <InteresadoForm
              interesado={selectedInteresado}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              transactionId={transaccionId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Interesados</p>
                <p className="text-lg font-semibold">{interestedParties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Alto Interés</p>
                <p className="text-lg font-semibold">
                  {interestedParties.filter(p => ['high', 'very_high'].includes(p.interest_level)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">En Negociación</p>
                <p className="text-lg font-semibold">
                  {interestedParties.filter(p => p.process_status === 'negotiation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cerrados</p>
                <p className="text-lg font-semibold">
                  {interestedParties.filter(p => ['closed_won', 'closed_lost'].includes(p.process_status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Interesados</CardTitle>
        </CardHeader>
        <CardContent>
          {interestedParties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay interesados registrados</p>
              <p className="text-sm">Añade el primer interesado para empezar a gestionar el proceso de venta</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Interés</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interestedParties.map((interesado) => (
                  <TableRow key={interesado.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{interesado.name}</p>
                        {interesado.position && (
                          <p className="text-sm text-muted-foreground">{interesado.position}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{interesado.company || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {interesado.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1" />
                            {interesado.email}
                          </div>
                        )}
                        {interesado.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {interesado.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getInterestLevelBadge(interesado.interest_level)}</TableCell>
                    <TableCell>{getProcessStatusBadge(interesado.process_status)}</TableCell>
                    <TableCell>
                      {interesado.financial_capacity ? formatCurrency(interesado.financial_capacity) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(interesado)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(interesado.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};