import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Star, Users, TrendingUp } from 'lucide-react';

interface WelcomeBannerProps {
  leadsCount: number;
  onCreateLead: () => void;
  onShowGuide: () => void;
}

export const WelcomeBanner = ({ leadsCount, onCreateLead, onShowGuide }: WelcomeBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) return null;

  const isFirstTime = leadsCount === 0;
  
  return (
    <Card className="relative overflow-hidden mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isFirstTime ? '¡Bienvenido al Control de Leads!' : '¡Excelente trabajo!'}
              </h3>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {isFirstTime 
                ? 'Comienza tu gestión de leads creando tu primer contacto potencial'
                : `Tienes ${leadsCount} leads en tu pipeline. Sigue optimizando tu proceso de ventas.`
              }
            </p>

            <div className="flex flex-wrap gap-2">
              {isFirstTime ? (
                <>
                  <Button onClick={onCreateLead} className="animate-pulse">
                    <Users className="h-4 w-4 mr-2" />
                    Crear mi primer Lead
                  </Button>
                  <Button variant="outline" onClick={onShowGuide}>
                    Ver guía rápida
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={onCreateLead}>
                    <Users className="h-4 w-4 mr-2" />
                    Agregar Lead
                  </Button>
                  <Button variant="outline" onClick={onShowGuide}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver guía de funciones
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};