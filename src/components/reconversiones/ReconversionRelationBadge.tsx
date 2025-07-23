import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, User, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReconversionRelationBadgeProps {
  type: 'lead' | 'mandate';
  id: string;
  name: string;
  status?: string;
  compact?: boolean;
}

export const ReconversionRelationBadge = ({ 
  type, 
  id, 
  name, 
  status, 
  compact = false 
}: ReconversionRelationBadgeProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === 'lead') {
      navigate(`/leads/${id}`);
    } else {
      navigate(`/mandatos/${id}`);
    }
  };

  const getIcon = () => {
    return type === 'lead' ? <User className="h-3 w-3" /> : <Building className="h-3 w-3" />;
  };

  const getVariant = () => {
    if (status === 'closed' || status === 'completed') return 'secondary';
    if (status === 'active') return 'default';
    return 'outline';
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-auto p-1 text-xs hover:bg-accent"
      >
        {getIcon()}
        <span className="ml-1 truncate max-w-[100px]">{name}</span>
        <ExternalLink className="h-2 w-2 ml-1" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        <span>{type === 'lead' ? 'Lead' : 'Mandato'}</span>
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-auto p-1 hover:bg-accent"
      >
        <span className="text-sm font-medium">{name}</span>
        <ExternalLink className="h-3 w-3 ml-1" />
      </Button>
      {status && (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      )}
    </div>
  );
};