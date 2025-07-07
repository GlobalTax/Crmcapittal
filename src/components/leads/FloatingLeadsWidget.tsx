import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { AlertCircle, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingLeadsWidget = () => {
  const { leads } = useLeads();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const newLeads = leads.filter(lead => lead.status === 'NEW');
  
  if (!isVisible || newLeads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="font-medium text-red-700">Nuevos Leads</span>
            <Badge color="red">{newLeads.length}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {newLeads.slice(0, 3).map((lead) => (
            <div key={lead.id} className="text-sm">
              <div className="font-medium">{lead.name}</div>
              <div className="text-gray-600 text-xs">{lead.email}</div>
            </div>
          ))}
          {newLeads.length > 3 && (
            <div className="text-xs text-gray-500">
              +{newLeads.length - 3} más...
            </div>
          )}
        </div>
        
        <Button 
          variant="primary" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/leads')}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver Todos
        </Button>
      </div>
    </div>
  );
};