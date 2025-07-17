import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Building, 
  Target,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';

export function RODEmptyState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djEwaDEwVjM0SDM2ek0yMCAyMHYxMGgxMFYyMEgyMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ROD Builder Premium</h1>
                <p className="text-primary-foreground/80 text-lg">
                  Herramienta avanzada para crear Reports de Oportunidades de Dealflow profesionales
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center max-w-2xl mx-auto">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-bold mb-4">¡Bienvenido a ROD Builder!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                No hay mandatos de venta o leads disponibles para crear tu ROD. 
                Comienza agregando algunas oportunidades para generar reportes profesionales.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Mandatos de Venta</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Gestiona oportunidades de venta con información detallada de empresas y valoraciones
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Leads Potenciales</h3>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Organiza leads cualificados con scoring automático y seguimiento personalizado
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200 dark:border-purple-800">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Reportes Avanzados</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Genera RODs profesionales con análisis automático y métricas detalladas
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="gap-2 px-8">
                  <Plus className="h-5 w-5" />
                  Agregar Mandato de Venta
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  <Search className="h-5 w-5" />
                  Explorar Leads
                </Button>
                <Button variant="ghost" size="lg" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualizar Datos
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Una vez que agregues oportunidades, podrás seleccionarlas, organizarlas por orden de prioridad 
                  y generar reportes ROD profesionales con un solo clic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}