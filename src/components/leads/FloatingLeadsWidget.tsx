import { useState } from 'react';
import { useOptimizedLeads } from '@/hooks/useOptimizedLeads';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { AlertCircle, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { OverdueTasksBadge } from '@/components/common/OverdueTasksBadge';

export const FloatingLeadsWidget = () => {
  const { leads = [], isLoading } = useOptimizedLeads({ status: 'NEW' });
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Early return if still loading
  if (isLoading) return null;

  // Ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Show widget if there are new leads OR unread notifications
  if (!isVisible || (safeLeads.length === 0 && unreadCount === 0)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-notification-enter">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-sm glass-effect">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse-glow" />
            <span className="font-medium text-red-700">Centro de Leads</span>
            {safeLeads.length > 0 && (
              <Badge color="red">{safeLeads.length}</Badge>
            )}
            {unreadCount > 0 && (
              <Badge color="yellow">{unreadCount} notif.</Badge>
            )}
            <OverdueTasksBadge />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {safeLeads.length > 0 && (
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {safeLeads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="text-sm p-2 bg-red-50 rounded">
                <div className="font-medium">{lead.name}</div>
                <div className="text-gray-600 text-xs">{lead.email}</div>
              </div>
            ))}
            {safeLeads.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{safeLeads.length - 3} más leads nuevos...
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/leads')}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ir al Control Center
          </Button>
          
          {unreadCount > 0 && (
            <div className="text-xs text-center text-muted-foreground">
              {unreadCount} notificaciones sin leer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};