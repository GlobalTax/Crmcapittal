
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Mail, Target, Plus } from "lucide-react";
import { useAutomation } from "@/hooks/useAutomation";
import { RevealSection } from '@/components/ui/RevealSection';

const AutomationDashboard = () => {
  const { rules, isLoading } = useAutomation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automatización</h2>
          <p className="text-muted-foreground">
            Gestiona reglas y flujos de automatización para leads
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
        </Button>
      </div>

      {/* Stats Cards (toggle) */}
      <RevealSection storageKey="automation/stats" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={4}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reglas Activas</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {rules.filter(rule => rule.enabled).length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Emails Enviados</p>
                  <p className="text-2xl font-semibold text-green-600">24</p>
                </div>
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tareas Creadas</p>
                  <p className="text-2xl font-semibold text-purple-600">12</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Leads Cualificados</p>
                  <p className="text-2xl font-semibold text-orange-600">8</p>
                </div>
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </RevealSection>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Automatización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{rule.name}</div>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{rule.description}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Trigger: {rule.trigger_type} | Prioridad: {rule.priority}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    {rule.enabled ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay reglas de automatización configuradas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationDashboard;
