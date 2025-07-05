import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Building, Phone, Mail, Zap } from 'lucide-react';

interface QuickActionsProps {
  className?: string;
}

export const QuickActions = ({ className }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Nuevo Lead',
      icon: User,
      onClick: () => navigate('/leads'),
      description: 'Agregar un nuevo prospecto'
    },
    {
      title: 'Nueva Empresa',
      icon: Building,
      onClick: () => navigate('/companies'),
      description: 'Registrar nueva empresa'
    },
    {
      title: 'Registrar Llamada',
      icon: Phone,
      onClick: () => console.log('Registrar llamada'),
      description: 'Anotar llamada realizada'
    },
    {
      title: 'Enviar Email',
      icon: Mail,
      onClick: () => navigate('/email'),
      description: 'Redactar nuevo email'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                onClick={action.onClick}
                className="h-auto p-4 flex flex-col items-center text-center hover:bg-accent hover:text-primary group"
              >
                <Icon className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};