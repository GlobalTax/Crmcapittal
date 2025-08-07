import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Eye, Calendar, AlertCircle, RefreshCcw } from 'lucide-react';
import { Lead, LeadStatus } from '@/types/Lead';
import { format, isAfter, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { scoreLeads } from '@/services/aiLeadScoring';
interface OptimizedLeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  selectedLeads: string[];
  onSelectLead: (leadId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateLead: (data: { id: string; updates: any }) => void;
}

export const OptimizedLeadTable = ({
  leads,
  isLoading,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  onUpdateLead
}: OptimizedLeadTableProps) => {
  const navigate = useNavigate();

  const [localScores, setLocalScores] = useState<Record<string, { aiScore: number; temperature: 'hot' | 'warm' | 'cold'; scoreReasons: string[] }>>({});

  const handleRecalcScore = async (lead: Lead) => {
    try {
      const [res] = await scoreLeads([lead]);
      if (res) {
        setLocalScores((prev) => ({
          ...prev,
          [lead.id]: {
            aiScore: res.aiScore,
            temperature: res.temperature,
            scoreReasons: res.scoreReasons,
          },
        }));
        toast.success('Score recalculado');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al recalcular el score');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 0) return 'bg-gray-500';
    return 'bg-gray-500';
  };
  const getTemperature = (lead: any): 'hot' | 'warm' | 'cold' | null => {
    const s: number | undefined = lead.aiScore ?? lead.lead_score;
    if (s == null) return null;
    if (s >= 80) return 'hot';
    if (s >= 50) return 'warm';
    return 'cold';
  };

  const getTempClasses = (temp: 'hot' | 'warm' | 'cold') => {
    switch (temp) {
      case 'hot':
        return 'bg-red-50 border border-red-200 text-red-700';
      case 'warm':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border border-gray-200 text-gray-600';
    }
  };

  const isUrgent = (lead: Lead) => {
    if (lead.status !== 'NEW') return false;
    const threeDaysAgo = subDays(new Date(), 3);
    return !lead.last_contacted || new Date(lead.last_contacted) < threeDaysAgo;
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await onUpdateLead({ id: leadId, updates: { status: newStatus } });
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDoubleClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`mailto:${email}`, '_self');
  };

  const getScoreProgress = (score: number) => {
    return Math.max(10, Math.min(100, score));
  };

  const getStatusVariant = (status: LeadStatus) => {
    const variants = {
      'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONTACTED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'QUALIFIED': 'bg-green-100 text-green-800 border-green-200',
      'DISQUALIFIED': 'bg-red-100 text-red-800 border-red-200',
      'NURTURING': 'bg-purple-100 text-purple-800 border-purple-200',
      'CONVERTED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'LOST': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return variants[status] || variants['NEW'];
  };

  const getStatusLabel = (status: LeadStatus) => {
    const labels = {
      'NEW': 'Nuevo',
      'CONTACTED': 'Contactado',
      'QUALIFIED': 'Calificado',
      'DISQUALIFIED': 'Descalificado',
      'NURTURING': 'En seguimiento',
      'CONVERTED': 'Convertido',
      'LOST': 'Perdido'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando leads...
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron leads
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) (ref as any).indeterminate = someSelected;
                }}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Nombre</TableHead>
            <TableHead className="min-w-[150px]">Empresa</TableHead>
            <TableHead className="min-w-[120px]">Estado</TableHead>
            <TableHead className="min-w-[120px]">Score AI</TableHead>
            <TableHead className="min-w-[150px]">Última actividad</TableHead>
            <TableHead className="min-w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const urgent = isUrgent(lead);
            const score = lead.lead_score || 0;
            
            return (
              <TableRow 
                key={lead.id} 
                className={`hover:bg-gray-50 cursor-pointer ${urgent ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                onDoubleClick={() => handleDoubleClick(lead.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => onSelectLead(lead.id, checked as boolean)}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{lead.name}</span>
                      {urgent && (
                        <div title="Sin contactar hace más de 3 días">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <span className="font-medium">{lead.company || 'Sin empresa'}</span>
                    {lead.phone && (
                      <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                  >
                    <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto">
                      <Badge variant="outline" className={getStatusVariant(lead.status)}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Nuevo</SelectItem>
                      <SelectItem value="CONTACTED">Contactado</SelectItem>
                      <SelectItem value="QUALIFIED">Calificado</SelectItem>
                      <SelectItem value="NURTURING">En seguimiento</SelectItem>
                      <SelectItem value="CONVERTED">Convertido</SelectItem>
                      <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                      <SelectItem value="LOST">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell>
                  {(() => {
                    const override = localScores[lead.id];
                    const score = override?.aiScore ?? (lead as any).aiScore ?? (lead as any).lead_score ?? 0;
                    const temp = override?.temperature ?? getTemperature(lead) ?? 'cold';
                    const reasons: string[] = override?.scoreReasons ?? (lead as any).scoreReasons ?? [];
                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTempClasses(temp)}`}>
                                {temp === 'hot' ? 'Hot' : temp === 'warm' ? 'Warm' : 'Cold'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Progress value={getScoreProgress(score)} className="w-16 h-2" />
                                <span className="text-sm font-medium w-8">{score}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          {reasons && reasons.length > 0 && (
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="text-xs font-medium mb-1">Razones del score</div>
                              <ul className="list-disc pl-4 space-y-1">
                                {reasons.slice(0, 5).map((r, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">{r}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })()}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {lead.last_activity_date ? (
                      <>
                        <div className="text-sm">
                          {format(new Date(lead.last_activity_date), "dd MMM", { locale: es })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lead.last_activity_type || 'Actividad'}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin actividad</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDoubleClick(lead.id)}
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {lead.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleCall(lead.phone!, e)}
                        title="Llamar"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRecalcScore(lead)}
                      title="Re-calcular Score"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    
                    {lead.next_follow_up_date && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title={`Seguimiento: ${format(new Date(lead.next_follow_up_date), "dd MMM yyyy", { locale: es })}`}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};