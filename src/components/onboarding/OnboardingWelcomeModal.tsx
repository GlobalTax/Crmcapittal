import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  Users,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';

interface OnboardingWelcomeModalProps {
  open: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

export const OnboardingWelcomeModal = ({ 
  open, 
  onStartTour, 
  onSkip 
}: OnboardingWelcomeModalProps) => {
  const features = [
    {
      icon: <Users className="h-4 w-4" />,
      title: "Gestión de Leads",
      description: "Captura y qualifica leads automáticamente"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Pipeline de Ventas",
      description: "Visualiza y gestiona tus oportunidades"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Documentos Inteligentes",
      description: "Genera propuestas y NDAs automáticamente"
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: "Alertas y Seguimiento",
      description: "Nunca pierdas una oportunidad importante"
    }
  ];

  const tourSteps = [
    "📥 Llegada y gestión de leads",
    "👤 Conversión lead → oportunidad",
    "📊 Visualización del pipeline",
    "📄 Generación de documentos",
    "🚨 Centro de notificaciones",
    "✅ Conversión a cliente final"
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            ¡Bienvenido a tu CRM!
          </DialogTitle>
          <p className="text-muted-foreground text-lg">
            Te guiaremos por las funciones principales para que puedas convertir leads en clientes exitosamente
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Tour Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Guía Interactiva (6 pasos)
              </h3>
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                ~5 minutos
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {tourSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Benefits */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="font-medium text-success text-sm">¿Por qué hacer la guía?</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Aprende el flujo completo Lead → Cliente</li>
              <li>• Conoce todas las funciones principales</li>
              <li>• Optimiza tu proceso de ventas desde el día 1</li>
              <li>• Evita errores comunes de nuevos usuarios</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Ver más tarde
          </Button>
          <Button onClick={onStartTour} className="flex-1">
            <ArrowRight className="h-4 w-4 mr-2" />
            Empezar guía paso a paso
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Podrás reactivar esta guía en cualquier momento desde tu perfil
        </p>
      </DialogContent>
    </Dialog>
  );
};