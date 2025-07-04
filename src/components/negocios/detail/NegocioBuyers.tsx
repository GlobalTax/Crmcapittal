import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Mail, Phone, Building, Star } from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface NegocioBuyersProps {
  negocio: Negocio;
}

interface Buyer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  investment_capacity: number;
  interest_level: 'low' | 'medium' | 'high';
  status: 'prospecting' | 'contacted' | 'interested' | 'evaluating' | 'declined' | 'offer_made';
  sector_experience: string;
  notes: string;
  first_contact_date: string;
  last_contact_date: string;
}

const interestLevels = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' }
];

const buyerStatuses = [
  { value: 'prospecting', label: 'Prospección' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'interested', label: 'Interesado' },
  { value: 'evaluating', label: 'Evaluando' },
  { value: 'declined', label: 'Rechazado' },
  { value: 'offer_made', label: 'Oferta Realizada' }
];

// Mock data - in real implementation, this would come from a database
const mockBuyers: Buyer[] = [
  {
    id: '1',
    name: 'Roberto Martínez',
    company: 'Grupo Inversor ABC',
    email: 'roberto@grupoinversor.com',
    phone: '+34 600 123 456',
    investment_capacity: 5000000,
    interest_level: 'high',
    status: 'evaluating',
    sector_experience: 'Tecnología, SaaS',
    notes: 'Muy interesado en empresas tecnológicas. Tiene experiencia previa en el sector.',
    first_contact_date: '2024-01-10',
    last_contact_date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ana Fernández',
    company: 'Capital Private Equity',
    email: 'ana@capitalprivate.com',
    phone: '+34 611 234 567',
    investment_capacity: 10000000,
    interest_level: 'medium',
    status: 'interested',
    sector_experience: 'Retail, E-commerce',
    notes: 'Busca oportunidades de crecimiento en retail.',
    first_contact_date: '2024-01-12',
    last_contact_date: '2024-01-14'
  }
];

export const NegocioBuyers = ({ negocio }: NegocioBuyersProps) => {
  const [buyers, setBuyers] = useState<Buyer[]>(mockBuyers);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    investment_capacity: '',
    interest_level: 'medium',
    status: 'prospecting',
    sector_experience: '',
    notes: ''
  });

  const getInterestColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospecting': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'evaluating': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'offer_made': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestLabel = (level: string) => {
    const interest = interestLevels.find(i => i.value === level);
    return interest ? interest.label : level;
  };

  const getStatusLabel = (status: string) => {
    const statusObj = buyerStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateBuyer = () => {
    if (buyerForm.name && buyerForm.company) {
      const newBuyer: Buyer = {
        id: Date.now().toString(),
        name: buyerForm.name,
        company: buyerForm.company,
        email: buyerForm.email,
        phone: buyerForm.phone,
        investment_capacity: buyerForm.investment_capacity ? parseInt(buyerForm.investment_capacity) : 0,
        interest_level: buyerForm.interest_level as Buyer['interest_level'],
        status: buyerForm.status as Buyer['status'],
        sector_experience: buyerForm.sector_experience,
        notes: buyerForm.notes,
        first_contact_date: new Date().toISOString().split('T')[0],
        last_contact_date: new Date().toISOString().split('T')[0]
      };
      
      setBuyers([...buyers, newBuyer]);
      setBuyerForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        investment_capacity: '',
        interest_level: 'medium',
        status: 'prospecting',
        sector_experience: '',
        notes: ''
      });
      setShowCreateDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compradores Potenciales
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Comprador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Comprador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyer-name">Nombre</Label>
                    <Input
                      id="buyer-name"
                      value={buyerForm.name}
                      onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-company">Empresa</Label>
                    <Input
                      id="buyer-company"
                      value={buyerForm.company}
                      onChange={(e) => setBuyerForm({ ...buyerForm, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-email">Email</Label>
                    <Input
                      id="buyer-email"
                      type="email"
                      value={buyerForm.email}
                      onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-phone">Teléfono</Label>
                    <Input
                      id="buyer-phone"
                      value={buyerForm.phone}
                      onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-capacity">Capacidad de Inversión (€)</Label>
                    <Input
                      id="buyer-capacity"
                      type="number"
                      value={buyerForm.investment_capacity}
                      onChange={(e) => setBuyerForm({ ...buyerForm, investment_capacity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-interest">Nivel de Interés</Label>
                    <Select value={buyerForm.interest_level} onValueChange={(value) => setBuyerForm({ ...buyerForm, interest_level: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {interestLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="buyer-experience">Experiencia en Sectores</Label>
                  <Input
                    id="buyer-experience"
                    value={buyerForm.sector_experience}
                    onChange={(e) => setBuyerForm({ ...buyerForm, sector_experience: e.target.value })}
                    placeholder="Ej: Tecnología, Retail, Salud..."
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-notes">Notas</Label>
                  <Textarea
                    id="buyer-notes"
                    value={buyerForm.notes}
                    onChange={(e) => setBuyerForm({ ...buyerForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateBuyer} disabled={!buyerForm.name || !buyerForm.company}>
                    Añadir Comprador
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {buyers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Interés</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Contacto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{buyer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {buyer.company}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {buyer.email && (
                        <div className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {buyer.email}
                        </div>
                      )}
                      {buyer.phone && (
                        <div className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {buyer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(buyer.investment_capacity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Badge className={getInterestColor(buyer.interest_level)}>
                        {getInterestLabel(buyer.interest_level)}
                      </Badge>
                      {buyer.interest_level === 'high' && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(buyer.status)}>
                      {getStatusLabel(buyer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {buyer.last_contact_date}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay compradores registrados</h3>
            <p className="text-sm mb-4">Añade compradores potenciales para este negocio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};