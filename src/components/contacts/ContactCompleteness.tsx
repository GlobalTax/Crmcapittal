import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, X, Mail, Phone, Building, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  job_title?: string;
  tags?: string[];
}

interface ContactCompletenessProps {
  contact: Contact;
  onUpdate: (updates: Partial<Contact>) => void;
  onAssociateByDomain: () => void;
  isAssociating?: boolean;
}

const COMPLETENESS_CHECKS = [
  { key: 'email', label: 'Email', icon: Mail, weight: 30 },
  { key: 'phone', label: 'Teléfono', icon: Phone, weight: 20 },
  { key: 'company_id', label: 'Empresa', icon: Building, weight: 25 },
  { key: 'job_title', label: 'Cargo', icon: Tag, weight: 15 },
  { key: 'tags', label: 'Tags (min 2)', icon: Tag, weight: 10 },
];

export function ContactCompleteness({ 
  contact, 
  onUpdate, 
  onAssociateByDomain, 
  isAssociating = false 
}: ContactCompletenessProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const calculateCompleteness = () => {
    let score = 0;
    let maxScore = 0;

    COMPLETENESS_CHECKS.forEach(check => {
      maxScore += check.weight;
      
      switch (check.key) {
        case 'email':
          if (contact.email) score += check.weight;
          break;
        case 'phone':
          if (contact.phone) score += check.weight;
          break;
        case 'company_id':
          if (contact.company_id) score += check.weight;
          break;
        case 'job_title':
          if (contact.job_title) score += check.weight;
          break;
        case 'tags':
          if (contact.tags && contact.tags.length >= 2) score += check.weight;
          break;
      }
    });

    return Math.round((score / maxScore) * 100);
  };

  const completeness = calculateCompleteness();
  const isComplete = (field: string) => {
    switch (field) {
      case 'email': return !!contact.email;
      case 'phone': return !!contact.phone;
      case 'company_id': return !!contact.company_id;
      case 'job_title': return !!contact.job_title;
      case 'tags': return !!(contact.tags && contact.tags.length >= 2);
      default: return false;
    }
  };

  const getProgressColor = () => {
    if (completeness >= 80) return 'bg-green-500';
    if (completeness >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      {/* Barra de completitud */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Completitud</span>
            <span className="text-sm text-muted-foreground">{completeness}%</span>
          </div>
          <Progress 
            value={completeness} 
            className={cn("h-2", "[&>div]:transition-colors", `[&>div]:${getProgressColor()}`)}
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChecklist(!showChecklist)}
          className="shrink-0"
        >
          <Check className="h-3 w-3 mr-1" />
          Detalles
        </Button>
      </div>

      {/* Botón Asociar por dominio */}
      {contact.email && !contact.company_id && (
        <Button
          onClick={onAssociateByDomain}
          disabled={isAssociating}
          size="sm"
          className="w-full"
        >
          <Building className="h-3 w-3 mr-2" />
          {isAssociating ? 'Asociando...' : 'Asociar por dominio'}
        </Button>
      )}

      {/* Checklist inline */}
      {showChecklist && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
          {COMPLETENESS_CHECKS.map(check => {
            const IconComponent = check.icon;
            const complete = isComplete(check.key);
            
            return (
              <div
                key={check.key}
                className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded",
                  complete ? "text-green-700 bg-green-50" : "text-muted-foreground"
                )}
              >
                {complete ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <X className="h-3 w-3 text-red-400" />
                )}
                <IconComponent className="h-3 w-3" />
                <span className="text-xs">{check.label}</span>
                {complete && check.key === 'tags' && (
                  <Badge variant="secondary" className="text-xs">
                    {contact.tags?.length}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}