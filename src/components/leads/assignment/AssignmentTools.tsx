import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Users, 
  BarChart3, 
  Settings, 
  Play, 
  Shuffle,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

interface AssignmentToolsProps {
  selectedWorkers: string[];
  selectedLeads: string[];
  onBulkAssign: (workerIds: string[]) => void;
  onAutoAssign: () => void;
  onRedistribute: () => void;
  isLoading: boolean;
}

export const AssignmentTools = ({
  selectedWorkers,
  selectedLeads,
  onBulkAssign,
  onAutoAssign,
  onRedistribute,
  isLoading
}: AssignmentToolsProps) => {
  const [autoAssignRules, setAutoAssignRules] = useState({
    maxLeadsPerWorker: 20,
    balanceByScore: true,
    considerWorkload: true,
    prioritizeSpecialization: false
  });

  const canBulkAssign = selectedWorkers.length > 0 && selectedLeads.length > 0;
  const canAutoAssign = selectedLeads.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Text variant="large" weight="semibold">Herramientas</Text>
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Selection Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selección Actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Text variant="small" color="muted">Trabajadores seleccionados</Text>
            <Badge variant={selectedWorkers.length > 0 ? "default" : "secondary"}>
              {selectedWorkers.length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Text variant="small" color="muted">Leads seleccionados</Text>
            <Badge variant={selectedLeads.length > 0 ? "default" : "secondary"}>
              {selectedLeads.length}
            </Badge>
          </div>

          {canBulkAssign && (
            <div className="pt-2">
              <Text variant="xs" color="muted">
                Distribución: ~{Math.ceil(selectedLeads.length / selectedWorkers.length)} leads por trabajador
              </Text>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Bulk Assignment */}
          <Button
            onClick={() => onBulkAssign(selectedWorkers)}
            disabled={!canBulkAssign || isLoading}
            className="w-full justify-start"
            variant={canBulkAssign ? "default" : "outline"}
          >
            <Users className="h-4 w-4 mr-2" />
            Asignación Manual
            {canBulkAssign && (
              <Badge variant="secondary" className="ml-auto">
                {selectedLeads.length}→{selectedWorkers.length}
              </Badge>
            )}
          </Button>

          <Separator />

          {/* Auto Assignment */}
          <Button
            onClick={onAutoAssign}
            disabled={!canAutoAssign || isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Asignación Automática
            {canAutoAssign && (
              <Badge variant="secondary" className="ml-auto">
                {selectedLeads.length}
              </Badge>
            )}
          </Button>

          {/* Redistribution */}
          <Button
            onClick={onRedistribute}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Rebalancear Carga
          </Button>
        </CardContent>
      </Card>

      {/* Auto-Assignment Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reglas de Asignación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text variant="small">Máximo por trabajador</Text>
              <input
                type="number"
                value={autoAssignRules.maxLeadsPerWorker}
                onChange={(e) => setAutoAssignRules(prev => ({
                  ...prev,
                  maxLeadsPerWorker: parseInt(e.target.value) || 20
                }))}
                className="w-16 px-2 py-1 text-sm border rounded"
                min="1"
                max="50"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAssignRules.balanceByScore}
                  onChange={(e) => setAutoAssignRules(prev => ({
                    ...prev,
                    balanceByScore: e.target.checked
                  }))}
                  className="rounded"
                />
                <Text variant="small">Balancear por score</Text>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAssignRules.considerWorkload}
                  onChange={(e) => setAutoAssignRules(prev => ({
                    ...prev,
                    considerWorkload: e.target.checked
                  }))}
                  className="rounded"
                />
                <Text variant="small">Considerar carga actual</Text>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAssignRules.prioritizeSpecialization}
                  onChange={(e) => setAutoAssignRules(prev => ({
                    ...prev,
                    prioritizeSpecialization: e.target.checked
                  }))}
                  className="rounded"
                />
                <Text variant="small">Priorizar especialización</Text>
              </label>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <Text variant="xs" color="muted">
              Las reglas se aplicarán en la asignación automática
            </Text>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <Text variant="small" color="muted">Procesando asignaciones...</Text>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};