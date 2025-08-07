import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRODTemplates } from '@/hooks/useRODTemplates';
import { 
  Zap, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface RODQuickStartDashboardProps {
  onSelectTemplate: (template: any) => void;
  onCreateFromDeals: () => void;
  onCreateFromScratch: () => void;
}

export function RODQuickStartDashboard({ 
  onSelectTemplate, 
  onCreateFromDeals, 
  onCreateFromScratch 
}: RODQuickStartDashboardProps) {
  const { templates, isLoading } = useRODTemplates();

  // Quick actions data
  const quickActions = [
    {
      id: 'deals',
      title: 'ROD desde Deals Activos',
      description: 'Generar ROD automáticamente desde tus deals de los últimos 30 días',
      icon: Zap,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      action: onCreateFromDeals,
      badge: 'Smart'
    },
    {
      id: 'mandates',
      title: 'ROD desde Mandatos',
      description: 'Crear reporte basado en mandatos activos y en pipeline',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      action: () => {}, // TODO: implement
      badge: 'Auto'
    },
    {
      id: 'custom',
      title: 'ROD Personalizado',
      description: 'Comenzar desde cero con editor completo y opciones avanzadas',
      icon: FileText,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      action: onCreateFromScratch,
      badge: 'Pro'
    }
  ];

  // Template categories
  const templateCategories = [
    { id: 'weekly', name: 'Semanal', count: templates?.filter(t => t.template_type === 'weekly').length || 0 },
    { id: 'monthly', name: 'Mensual', count: templates?.filter(t => t.template_type === 'monthly').length || 0 },
    { id: 'sector', name: 'Sector', count: templates?.filter(t => t.template_type === 'sector').length || 0 },
    { id: 'custom', name: 'Personalizado', count: templates?.filter(t => t.template_type === 'custom').length || 0 }
  ];

  const popularTemplates = templates?.filter(t => t.is_public).slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Sparkles className="h-8 w-8 text-primary" />
          <span>ROD Builder Inteligente</span>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Crea reportes de oportunidades profesionales en minutos con nuestras herramientas automatizadas
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card 
            key={action.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 overflow-hidden"
            onClick={action.action}
          >
            <CardContent className="p-0">
              <div className={`${action.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {action.badge}
                  </Badge>
                </div>
                <action.icon className="h-12 w-12 mb-4 opacity-90" />
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{action.description}</p>
              </div>
              <div className="p-4 bg-card">
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Comenzar
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Categories */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Templates Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templateCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary">{category.count}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver Todos los Templates
            </Button>
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Templates Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {template.template_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{template.usage_count} usos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>5 min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-sm text-muted-foreground">RODs este mes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">89%</div>
              <p className="text-sm text-muted-foreground">Tasa de apertura</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">156</div>
              <p className="text-sm text-muted-foreground">Suscriptores activos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">23</div>
              <p className="text-sm text-muted-foreground">Nuevos leads</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}