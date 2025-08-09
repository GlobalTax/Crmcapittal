import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Building, DollarSign, Users, MapPin, Globe, Tags } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEinformaEnrichment } from '@/hooks/useEinformaEnrichment';

interface Company {
  id: string;
  name: string;
  industry?: string;
  annual_revenue?: number;
  company_size?: string;
  country?: string;
  city?: string;
  website?: string;
  description?: string;
  nif?: string;
  tags?: string[];
}

interface CompanyCompletenessProps {
  company: Company;
  onUpdate: (updates: Partial<Company>) => void;
  onEnrich?: () => void;
  isEnriching?: boolean;
}

const COMPLETENESS_CHECKS = [
  { key: 'industry', label: 'Industria', icon: Building, weight: 20 },
  { key: 'annual_revenue', label: 'Facturación', icon: DollarSign, weight: 15 },
  { key: 'company_size', label: 'Tamaño', icon: Users, weight: 15 },
  { key: 'location', label: 'Ubicación', icon: MapPin, weight: 10 },
  { key: 'website', label: 'Website', icon: Globe, weight: 10 },
  { key: 'description', label: 'Descripción', icon: Building, weight: 15 },
  { key: 'tags', label: 'Tags (min 3)', icon: Tags, weight: 15 },
];

export function CompanyCompleteness({ 
  company, 
  onUpdate, 
  onEnrich,
  isEnriching = false 
}: CompanyCompletenessProps) {
  const [showChecklist, setShowChecklist] = useState(false);
  const { enrichCompany, isEnriching: isEnrichingEinforma } = useEinformaEnrichment();

  const calculateCompleteness = () => {
    let score = 0;
    let maxScore = 0;

    COMPLETENESS_CHECKS.forEach(check => {
      maxScore += check.weight;
      
      switch (check.key) {
        case 'industry':
          if (company.industry) score += check.weight;
          break;
        case 'annual_revenue':
          if (company.annual_revenue && company.annual_revenue > 0) score += check.weight;
          break;
        case 'company_size':
          if (company.company_size) score += check.weight;
          break;
        case 'location':
          if (company.country || company.city) score += check.weight;
          break;
        case 'website':
          if (company.website) score += check.weight;
          break;
        case 'description':
          if (company.description && company.description.length > 20) score += check.weight;
          break;
        case 'tags':
          if (company.tags && company.tags.length >= 3) score += check.weight;
          break;
      }
    });

    return Math.round((score / maxScore) * 100);
  };

  const completeness = calculateCompleteness();
  
  const isComplete = (field: string) => {
    switch (field) {
      case 'industry': return !!company.industry;
      case 'annual_revenue': return !!(company.annual_revenue && company.annual_revenue > 0);
      case 'company_size': return !!company.company_size;
      case 'location': return !!(company.country || company.city);
      case 'website': return !!company.website;
      case 'description': return !!(company.description && company.description.length > 20);
      case 'tags': return !!(company.tags && company.tags.length >= 3);
      default: return false;
    }
  };

  const getProgressColor = () => {
    if (completeness >= 80) return 'bg-green-500';
    if (completeness >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleEnrich = async () => {
    if (company.nif) {
      try {
        await enrichCompany({ companyId: company.id, nif: company.nif });
      } catch (error) {
        console.error('Error enriching company:', error);
      }
    } else if (onEnrich) {
      onEnrich();
    }
  };

  const canEnrich = company.nif || onEnrich;

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
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChecklist(!showChecklist)}
          >
            <Check className="h-3 w-3 mr-1" />
            Detalles
          </Button>
          
          {canEnrich && (
            <Button
              onClick={handleEnrich}
              disabled={isEnriching || isEnrichingEinforma}
              size="sm"
              className="shrink-0"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {(isEnriching || isEnrichingEinforma) ? 'Enriqueciendo...' : 'Enriquecer'}
            </Button>
          )}
        </div>
      </div>

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
                    {company.tags?.length}
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