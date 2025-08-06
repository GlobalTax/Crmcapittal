import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  Briefcase, 
  FileText, 
  Phone, 
  Mail,
  CheckCircle,
  TrendingUp 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'call' | 'email' | 'completed';
  message: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  className?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'lead',
    message: 'Nuevo lead registrado: María González - Tech Solutions',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: 'Carlos Ruiz'
  },
  {
    id: '2',
    type: 'deal',
    message: 'Negocio movido a "Propuesta Enviada" - €250.000',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: 'Ana García'
  },
  {
    id: '3',
    type: 'completed',
    message: 'Tarea completada: Llamar a cliente potencial',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: 'Luis Martín'
  },
  {
    id: '4',
    type: 'call',
    message: 'Llamada programada con Inversiones ABC para mañana',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    user: 'Carmen López'
  },
  {
    id: '5',
    type: 'email',
    message: 'Email enviado a 15 leads del sector tecnológico',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    user: 'David Ruiz'
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'lead':
      return User;
    case 'deal':
      return TrendingUp;
    case 'task':
      return FileText;
    case 'call':
      return Phone;
    case 'email':
      return Mail;
    case 'completed':
      return CheckCircle;
    default:
      return FileText;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'lead':
      return 'text-primary bg-primary/10';
    case 'deal':
      return 'text-success bg-success/10';
    case 'completed':
      return 'text-success bg-success/10';
    case 'call':
      return 'text-warning bg-warning/10';
    case 'email':
      return 'text-info bg-info/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ className }) => {
  return (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Actividad Reciente</h3>
        <button 
          onClick={() => window.location.href = '/activities'}
          className="text-sm text-primary hover:underline"
        >
          Ver todo
        </button>
      </div>
      
      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                colorClass
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground font-medium">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(activity.timestamp, 'HH:mm', { locale: es })}
                  </span>
                  {activity.user && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.user}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};