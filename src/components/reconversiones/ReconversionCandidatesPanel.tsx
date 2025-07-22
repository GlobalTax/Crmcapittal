import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, Phone, Mail, MapPin, Euro, MessageSquare, Search } from 'lucide-react';
import { useReconversionCandidates } from '@/hooks/useReconversionCandidates';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';

interface ReconversionCandidatesPanelProps {
  reconversionId: string;
}

export function ReconversionCandidatesPanel({ reconversionId }: ReconversionCandidatesPanelProps) {
  const { candidates, loading, addCandidate, updateCandidate, refetch } = useReconversionCandidates(reconversionId);
  const { companies } = useCompanies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCandidate = async () => {
    if (!selectedCompany) return;

    try {
      await addCandidate({
        reconversion_id: reconversionId,
        company_id: selectedCompany.id,
        company_name: selectedCompany.name,
        company_sector: selectedCompany.industry,
        company_location: selectedCompany.city,
        company_revenue: selectedCompany.annual_revenue,
        contact_status: 'pendiente',
        created_by: 'current-user-id', // This should be from auth context
        match_score: 0.8
      });
      
      toast.success('Candidato añadido correctamente');
      setIsAddDialogOpen(false);
      setSelectedCompany(null);
      setSearchTerm('');
    } catch (error) {
      toast.error('Error al añadir candidato');
    }
  };

  const handleUpdateContactStatus = async (candidateId: string, status: string, notes?: string) => {
    try {
      await updateCandidate(candidateId, {
        contact_status: status,
        contact_notes: notes,
        contact_date: new Date().toISOString()
      });
      
      toast.success('Estado de contacto actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interesado': return 'bg-green-500';
      case 'no_interesado': return 'bg-red-500';
      case 'pendiente': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'interesado': return 'Interesado';
      case 'no_interesado': return 'No Interesado';
      case 'pendiente': return 'Pendiente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Candidatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Candidatos ({candidates.length})
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Candidato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Añadir Candidato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar empresa</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre o sector..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {searchTerm && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCompany?.id === company.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-muted'
                        }`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {company.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {company.city}
                                </span>
                              )}
                              {company.annual_revenue && (
                                <span className="flex items-center gap-1">
                                  <Euro className="h-3 w-3" />
                                  {(company.annual_revenue / 1000000).toFixed(1)}M
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCandidate} disabled={!selectedCompany}>
                    Añadir Candidato
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay candidatos añadidos aún
            </p>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onUpdateStatus={handleUpdateContactStatus}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CandidateCardProps {
  candidate: any;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}

function CandidateCard({ candidate, onUpdateStatus }: CandidateCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [status, setStatus] = useState(candidate.contact_status);
  const [notes, setNotes] = useState(candidate.contact_notes || '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interesado': return 'bg-green-500';
      case 'no_interesado': return 'bg-red-500';
      case 'pendiente': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'interesado': return 'Interesado';
      case 'no_interesado': return 'No Interesado';
      case 'pendiente': return 'Pendiente';
      default: return status;
    }
  };

  const handleUpdate = () => {
    onUpdateStatus(candidate.id, status, notes);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{candidate.company_name}</h4>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {candidate.company_sector && (
              <span>{candidate.company_sector}</span>
            )}
            {candidate.company_location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.company_location}
              </span>
            )}
            {candidate.company_revenue && (
              <span className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                {(candidate.company_revenue / 1000000).toFixed(1)}M
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(candidate.contact_status)} text-white`}>
            {getStatusText(candidate.contact_status)}
          </Badge>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar Estado de Contacto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="interesado">Interesado</SelectItem>
                      <SelectItem value="no_interesado">No Interesado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añadir comentarios sobre el contacto..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdate}>
                    Actualizar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {candidate.contact_notes && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          <strong>Notas:</strong> {candidate.contact_notes}
        </div>
      )}
      
      {candidate.match_score && (
        <div className="text-xs text-muted-foreground">
          Puntuación de coincidencia: {(candidate.match_score * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}