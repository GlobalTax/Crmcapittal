import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDays, Euro, Target, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { OpportunityWithContacts, OpportunityStage, OpportunityPriority } from '@/types/Opportunity';
import { OpportunityTimeline } from './OpportunityTimeline';
import { OpportunityActionsBar } from './OpportunityActionsBar';
import { OpportunityContactsTab } from './OpportunityContactsTab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpportunityDetailViewProps {
  opportunity: OpportunityWithContacts;
  onUpdateStage?: (newStage: string) => void;
  onUpdateOpportunity?: (updates: Partial<OpportunityWithContacts>) => void;
}

const stages = [
  { value: 'prospecting', label: 'Prospección', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualification', label: 'Cualificación', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposal', label: 'Propuesta', color: 'bg-orange-100 text-orange-800' },
  { value: 'negotiation', label: 'Negociación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed_won', label: 'Ganado', color: 'bg-green-100 text-green-800' },
  { value: 'closed_lost', label: 'Perdido', color: 'bg-red-100 text-red-800' },
];

const priorities = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Media', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' },
];

export const OpportunityDetailView = ({ 
  opportunity, 
  onUpdateStage, 
  onUpdateOpportunity 
}: OpportunityDetailViewProps) => {
  const [selectedStage, setSelectedStage] = useState<OpportunityStage>(opportunity.stage as OpportunityStage);
  const [selectedPriority, setSelectedPriority] = useState<OpportunityPriority>((opportunity.priority as OpportunityPriority) || 'medium');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    title: opportunity.title,
    description: opportunity.description || '',
    value: opportunity.value || 0,
    probability: opportunity.probability || 50,
    close_date: opportunity.close_date || '',
  });

  const handleStageChange = (value: string) => {
    const stage = value as OpportunityStage;
    setSelectedStage(stage);
    onUpdateStage?.(value);
  };

  const handlePriorityChange = (value: string) => {
    const priority = value as OpportunityPriority;
    setSelectedPriority(priority);
    onUpdateOpportunity?.({ priority });
  };

  const handleSaveChanges = () => {
    onUpdateOpportunity?.(editValues);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: opportunity.currency || 'EUR'
    }).format(amount);
  };

  const getStageInfo = (stage: string) => {
    return stages.find(s => s.value === stage) || stages[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const stageInfo = getStageInfo(selectedStage);
  const priorityInfo = getPriorityInfo(selectedPriority);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Columna izquierda - Información clave */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editValues.title}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    className="font-semibold text-lg"
                  />
                ) : (
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                )}
                <CardDescription className="mt-1">
                  {opportunity.company?.name || 'Sin empresa asociada'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Valor de la oportunidad */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Euro className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Valor</div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.value}
                    onChange={(e) => setEditValues({ ...editValues, value: Number(e.target.value) })}
                    className="font-semibold"
                  />
                ) : (
                  <div className="font-semibold text-lg">
                    {opportunity.value ? formatCurrency(opportunity.value) : 'No definido'}
                  </div>
                )}
              </div>
            </div>

            {/* Probabilidad */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Probabilidad</div>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editValues.probability}
                    onChange={(e) => setEditValues({ ...editValues, probability: Number(e.target.value) })}
                    className="font-semibold"
                  />
                ) : (
                  <div className="font-semibold">{opportunity.probability || 50}%</div>
                )}
              </div>
            </div>

            {/* Fecha de cierre */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Fecha de cierre</div>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editValues.close_date?.split('T')[0] || ''}
                    onChange={(e) => setEditValues({ ...editValues, close_date: e.target.value })}
                    className="font-semibold"
                  />
                ) : (
                  <div className="font-semibold">
                    {opportunity.close_date 
                      ? format(new Date(opportunity.close_date), 'dd/MM/yyyy', { locale: es })
                      : 'No definida'
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Estado actual */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Estado:</div>
              <Select value={selectedStage} onValueChange={handleStageChange}>
                <SelectTrigger>
                  <SelectValue>
                    <Badge className={stageInfo.color}>
                      {stageInfo.label}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Prioridad:</div>
              <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue>
                    <Badge className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información adicional */}
            <div className="pt-2 border-t space-y-2 text-sm text-muted-foreground">
              <div>Creado: {format(new Date(opportunity.created_at), 'dd/MM/yyyy', { locale: es })}</div>
              {opportunity.deal_source && (
                <div>Fuente: {opportunity.deal_source}</div>
              )}
              {opportunity.sector && (
                <div>Sector: {opportunity.sector}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha - Tabs con contenido principal */}
      <div className="lg:col-span-3">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="contacts">Contactos</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OpportunityActionsBar opportunityId={opportunity.id} />
            
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    placeholder="Descripción de la oportunidad..."
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {opportunity.description || 'Sin descripción disponible'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Métricas adicionales */}
            {(opportunity.revenue || opportunity.ebitda || opportunity.employees) && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la empresa objetivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {opportunity.revenue && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">Ingresos</div>
                          <div className="font-semibold">{formatCurrency(opportunity.revenue)}</div>
                        </div>
                      </div>
                    )}
                    {opportunity.ebitda && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">EBITDA</div>
                          <div className="font-semibold">{formatCurrency(opportunity.ebitda)}</div>
                        </div>
                      </div>
                    )}
                    {opportunity.employees && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">Empleados</div>
                          <div className="font-semibold">{opportunity.employees}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="activity">
            <OpportunityTimeline opportunityId={opportunity.id} />
          </TabsContent>
          
          <TabsContent value="contacts">
            <OpportunityContactsTab opportunity={opportunity} />
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema de notas en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};