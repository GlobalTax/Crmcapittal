import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  TrendingUp, 
  CheckCircle, 
  Phone, 
  Mail 
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'call' | 'email';
  message: string;
  timestamp: Date;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'lead',
    message: 'Nuevo lead: María González - Tech Solutions',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    type: 'deal',
    message: 'Negocio movido a "Propuesta Enviada" - €250.000',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '3',
    type: 'task',
    message: 'Tarea completada: Llamar a cliente potencial',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: '4',
    type: 'call',
    message: 'Llamada programada con Inversiones ABC',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '5',
    type: 'email',
    message: 'Email enviado a 15 leads del sector tecnológico',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000)
  }
];

const getIcon = (type: Activity['type']) => {
  switch (type) {
    case 'lead': return User;
    case 'deal': return TrendingUp;
    case 'task': return CheckCircle;
    case 'call': return Phone;
    case 'email': return Mail;
    default: return CheckCircle;
  }
};

export const CompactActivityFeed: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Actividad reciente</h3>
        <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
          Ver todo
        </button>
      </div>
      
      <div className="space-y-3">
        {mockActivities.slice(0, 5).map((activity) => {
          const Icon = getIcon(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-gray-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {activity.message}
                </p>
                <span className="text-xs text-gray-600">
                  {format(activity.timestamp, 'HH:mm', { locale: es })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};