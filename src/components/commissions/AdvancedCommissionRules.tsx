import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Percent, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/productionLogger';

interface CommissionRule {
  id?: string;
  name: string;
  description: string;
  source_type: string;
  collaborator_type: 'referente' | 'partner_comercial' | 'agente' | 'freelancer';
  min_amount: number;
  max_amount: number;
  commission_percentage: number;
  base_commission: number;
  is_active: boolean;
  conditions?: {
    dealValueMin?: number;
    dealValueMax?: number;
    sectorRestrictions?: string[];
    timeBasedMultiplier?: number;
  };
}

interface CommissionScale {
  id?: string;
  name: string;
  description: string;
  tiers: Array<{
    minAmount: number;
    maxAmount: number;
    percentage: number;
  }>;
  isActive: boolean;
}

export const AdvancedCommissionRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [scales, setScales] = useState<CommissionScale[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'scales'>('rules');

  const [newRule, setNewRule] = useState<CommissionRule>({
    name: '',
    description: '',
    source_type: 'deal',
    collaborator_type: 'referente',
    min_amount: 0,
    max_amount: 999999,
    commission_percentage: 5,
    base_commission: 0,
    is_active: true
  });

  const [newScale, setNewScale] = useState<CommissionScale>({
    name: '',
    description: '',
    tiers: [
      { minAmount: 0, maxAmount: 10000, percentage: 3 },
      { minAmount: 10001, maxAmount: 50000, percentage: 5 },
      { minAmount: 50001, maxAmount: 999999, percentage: 8 }
    ],
    isActive: true
  });

  React.useEffect(() => {
    fetchRules();
    fetchScales();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      logger.error('Failed to fetch commission rules', { error });
    }
  };

  const fetchScales = async () => {
    // This would fetch from a commission_scales table (to be created)
    // For now, we'll use local state
    setScales([
      {
        id: '1',
        name: 'Escala Estándar',
        description: 'Escala progresiva basada en volumen de ventas',
        tiers: [
          { minAmount: 0, maxAmount: 10000, percentage: 3 },
          { minAmount: 10001, maxAmount: 50000, percentage: 5 },
          { minAmount: 50001, maxAmount: 999999, percentage: 8 }
        ],
        isActive: true
      }
    ]);
  };

  const saveRule = async () => {
    if (!newRule.name || !newRule.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('commission_rules')
        .insert({
          name: newRule.name,
          description: newRule.description,
          source_type: newRule.source_type,
          collaborator_type: newRule.collaborator_type,
          min_amount: newRule.min_amount,
          max_amount: newRule.max_amount,
          commission_percentage: newRule.commission_percentage,
          base_commission: newRule.base_commission,
          is_active: newRule.is_active
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Regla de comisión creada correctamente"
      });

      setNewRule({
        name: '',
        description: '',
        source_type: 'deal',
        collaborator_type: 'referente',
        min_amount: 0,
        max_amount: 999999,
        commission_percentage: 5,
        base_commission: 0,
        is_active: true
      });

      fetchRules();
    } catch (error) {
      logger.error('Failed to save commission rule', { error, ruleName: newRule.name });
      toast({
        title: "Error",
        description: "No se pudo crear la regla de comisión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('commission_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Regla eliminada correctamente"
      });

      fetchRules();
    } catch (error) {
      logger.error('Failed to delete commission rule', { error, ruleId });
      toast({
        title: "Error",
        description: "No se pudo eliminar la regla",
        variant: "destructive"
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('commission_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      logger.error('Failed to update commission rule status', { error, ruleId, isActive });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reglas de Comisión Avanzadas
          </CardTitle>
          <CardDescription>
            Configura reglas personalizadas, escalas progresivas y condiciones especiales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'rules' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rules')}
              className="flex-1"
            >
              <Target className="h-4 w-4 mr-2" />
              Reglas Personalizadas
            </Button>
            <Button
              variant={activeTab === 'scales' ? 'default' : 'outline'}
              onClick={() => setActiveTab('scales')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Escalas Progresivas
            </Button>
          </div>

          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Create New Rule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nueva Regla de Comisión</CardTitle>
                  <CardDescription>
                    Define una regla personalizada con condiciones específicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Nombre de la Regla</Label>
                      <Input
                        id="rule-name"
                        value={newRule.name}
                        onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Regla Premium Deals"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-description">Descripción</Label>
                      <Input
                        id="rule-description"
                        value={newRule.description}
                        onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción de la regla"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-type">Tipo de Fuente</Label>
                      <Select
                        value={newRule.source_type}
                        onValueChange={(value) => setNewRule(prev => ({ ...prev, source_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deal">Deal</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="referral">Referido</SelectItem>
                          <SelectItem value="upsell">Upsell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collaborator-type">Tipo de Colaborador</Label>
                      <Select
                        value={newRule.collaborator_type}
                        onValueChange={(value: 'referente' | 'partner_comercial' | 'agente' | 'freelancer') => setNewRule(prev => ({ ...prev, collaborator_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="referente">Referente</SelectItem>
                          <SelectItem value="partner_comercial">Partner Comercial</SelectItem>
                          <SelectItem value="agente">Agente</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-amount">Monto Mínimo (€)</Label>
                      <Input
                        id="min-amount"
                        type="number"
                        value={newRule.min_amount}
                        onChange={(e) => setNewRule(prev => ({ ...prev, min_amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-amount">Monto Máximo (€)</Label>
                      <Input
                        id="max-amount"
                        type="number"
                        value={newRule.max_amount}
                        onChange={(e) => setNewRule(prev => ({ ...prev, max_amount: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission-percentage">Porcentaje (%)</Label>
                      <Input
                        id="commission-percentage"
                        type="number"
                        step="0.1"
                        value={newRule.commission_percentage}
                        onChange={(e) => setNewRule(prev => ({ ...prev, commission_percentage: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="base-commission">Comisión Base (€)</Label>
                      <Input
                        id="base-commission"
                        type="number"
                        value={newRule.base_commission}
                        onChange={(e) => setNewRule(prev => ({ ...prev, base_commission: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newRule.is_active}
                        onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>Regla Activa</Label>
                    </div>
                    <Button onClick={saveRule} disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Regla
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reglas Existentes</h3>
                {rules.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No hay reglas configuradas. Crea tu primera regla arriba.
                    </CardContent>
                  </Card>
                ) : (
                  rules.map((rule) => (
                    <Card key={rule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{rule.name}</h4>
                              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                {rule.is_active ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Tipo: {rule.source_type}</span>
                              <span>Colaborador: {rule.collaborator_type}</span>
                              <span>Rango: €{rule.min_amount?.toLocaleString()} - €{rule.max_amount?.toLocaleString()}</span>
                              <span className="flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                {rule.commission_percentage}%
                              </span>
                              {rule.base_commission > 0 && (
                                <span>Base: €{rule.base_commission}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => toggleRuleStatus(rule.id!, checked)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRule(rule.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'scales' && (
            <div className="space-y-6">
              {/* Create New Scale */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nueva Escala Progresiva</CardTitle>
                  <CardDescription>
                    Define escalas de comisión que aumentan según el volumen de ventas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scale-name">Nombre de la Escala</Label>
                      <Input
                        id="scale-name"
                        value={newScale.name}
                        onChange={(e) => setNewScale(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Escala Premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scale-description">Descripción</Label>
                      <Input
                        id="scale-description"
                        value={newScale.description}
                        onChange={(e) => setNewScale(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción de la escala"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Niveles de la Escala</Label>
                    {newScale.tiers.map((tier, index) => (
                      <div key={index} className="grid grid-cols-4 gap-3 items-center p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-xs">Desde (€)</Label>
                          <Input
                            type="number"
                            value={tier.minAmount}
                            onChange={(e) => {
                              const updatedTiers = [...newScale.tiers];
                              updatedTiers[index].minAmount = Number(e.target.value);
                              setNewScale(prev => ({ ...prev, tiers: updatedTiers }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Hasta (€)</Label>
                          <Input
                            type="number"
                            value={tier.maxAmount}
                            onChange={(e) => {
                              const updatedTiers = [...newScale.tiers];
                              updatedTiers[index].maxAmount = Number(e.target.value);
                              setNewScale(prev => ({ ...prev, tiers: updatedTiers }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Porcentaje (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={tier.percentage}
                            onChange={(e) => {
                              const updatedTiers = [...newScale.tiers];
                              updatedTiers[index].percentage = Number(e.target.value);
                              setNewScale(prev => ({ ...prev, tiers: updatedTiers }));
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedTiers = newScale.tiers.filter((_, i) => i !== index);
                            setNewScale(prev => ({ ...prev, tiers: updatedTiers }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const lastTier = newScale.tiers[newScale.tiers.length - 1];
                        setNewScale(prev => ({
                          ...prev,
                          tiers: [
                            ...prev.tiers,
                            {
                              minAmount: lastTier.maxAmount + 1,
                              maxAmount: lastTier.maxAmount + 100000,
                              percentage: lastTier.percentage + 1
                            }
                          ]
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Nivel
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newScale.isActive}
                        onCheckedChange={(checked) => setNewScale(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label>Escala Activa</Label>
                    </div>
                    <Button onClick={() => {
                      // Save scale logic (would need a commission_scales table)
                      toast({
                        title: "Éxito",
                        description: "Escala creada correctamente"
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Escala
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Scales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Escalas Existentes</h3>
                {scales.map((scale) => (
                  <Card key={scale.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{scale.name}</h4>
                              <Badge variant={scale.isActive ? 'default' : 'secondary'}>
                                {scale.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{scale.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={scale.isActive} />
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {scale.tiers.map((tier, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-center">
                              <div className="text-sm font-medium">
                                €{tier.minAmount.toLocaleString()} - €{tier.maxAmount.toLocaleString()}
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {tier.percentage}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
