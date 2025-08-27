import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useOpenAIAssistant } from '@/hooks/useOpenAIAssistant';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/productionLogger';

interface Company {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  annual_revenue?: number;
  company_size?: string;
  tags?: string[];
}

interface TagSuggestion {
  tag: string;
  confidence: number;
  reason: string;
}

interface CompanyTagSuggestionsProps {
  company: Company;
  onTagsUpdate: (tags: string[]) => void;
  className?: string;
}

export function CompanyTagSuggestions({ 
  company, 
  onTagsUpdate, 
  className 
}: CompanyTagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTags, setAcceptedTags] = useState<Set<string>>(new Set());
  const [rejectedTags, setRejectedTags] = useState<Set<string>>(new Set());
  
  const { generateSegmentationRulesWithAI } = useOpenAIAssistant();

  const generateSuggestions = async () => {
    if (!company.name) return;
    
    setIsLoading(true);
    try {
      // Usar la IA para generar sugerencias de tags
      const prompt = `
        Genera 5-8 tags específicos y útiles para esta empresa:
        - Nombre: ${company.name}
        - Industria: ${company.industry || 'No especificada'}
        - Descripción: ${company.description || 'No disponible'}
        - Tamaño: ${company.company_size || 'No especificado'}
        - Facturación: ${company.annual_revenue ? `€${company.annual_revenue.toLocaleString()}` : 'No especificada'}
        
        Devuelve un JSON con este formato:
        {
          "suggestions": [
            {"tag": "manufacturing", "confidence": 0.9, "reason": "Empresa del sector manufacturero"},
            {"tag": "mid-market", "confidence": 0.8, "reason": "Facturación entre 10-100M€"}
          ]
        }
        
        Enfócate en:
        - Sector/industria específica
        - Tamaño de empresa (startup, SME, enterprise)
        - Tipo de negocio (B2B, B2C, marketplace)
        - Tecnología usada
        - Mercado objetivo
        - Capacidad financiera
      `;

      const result = await generateSegmentationRulesWithAI(prompt);
      
      if (result.rules && typeof result.rules === 'string') {
        try {
          const parsed = JSON.parse(result.rules);
          if (parsed.suggestions) {
            setSuggestions(parsed.suggestions);
          }
        } catch (e) {
          logger.error('Error parsing AI response for tag suggestions', { error: e, companyId: company.id }, 'CompanyTagSuggestions');
        }
      }
    } catch (error) {
      logger.error('Error generating tag suggestions with AI', { error, companyId: company.id }, 'CompanyTagSuggestions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (company.id && (!company.tags || company.tags.length < 3)) {
      generateSuggestions();
    }
  }, [company.id]);

  const acceptTag = (tag: string) => {
    const newAccepted = new Set(acceptedTags);
    newAccepted.add(tag);
    setAcceptedTags(newAccepted);
    
    const rejectedSet = new Set(rejectedTags);
    rejectedSet.delete(tag);
    setRejectedTags(rejectedSet);
    
    // Añadir tag a la empresa
    const currentTags = company.tags || [];
    if (!currentTags.includes(tag)) {
      onTagsUpdate([...currentTags, tag]);
    }
  };

  const rejectTag = (tag: string) => {
    const newRejected = new Set(rejectedTags);
    newRejected.add(tag);
    setRejectedTags(newRejected);
    
    const acceptedSet = new Set(acceptedTags);
    acceptedSet.delete(tag);
    setAcceptedTags(acceptedSet);
    
    // Remover tag de la empresa si estaba
    const currentTags = company.tags || [];
    onTagsUpdate(currentTags.filter(t => t !== tag));
  };

  const getTagStatus = (tag: string) => {
    if (acceptedTags.has(tag)) return 'accepted';
    if (rejectedTags.has(tag)) return 'rejected';
    return 'pending';
  };

  const visibleSuggestions = suggestions.filter(s => !rejectedTags.has(s.tag));

  if (!isLoading && visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Sugerencias de Tags IA</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
            className="ml-auto text-xs"
          >
            Regenerar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Generando sugerencias...
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleSuggestions.map((suggestion, index) => {
              const status = getTagStatus(suggestion.tag);
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded border transition-all",
                    status === 'accepted' && "bg-green-50 border-green-200",
                    status === 'rejected' && "bg-red-50 border-red-200",
                    status === 'pending' && "bg-background hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={status === 'accepted' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {suggestion.tag}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {suggestion.reason}
                    </p>
                  </div>
                  
                  {status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acceptTag(suggestion.tag)}
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectTag(suggestion.tag)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {status === 'accepted' && (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Estadísticas */}
        {suggestions.length > 0 && !isLoading && (
          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
            <span>Aceptadas: {acceptedTags.size}</span>
            <span>Rechazadas: {rejectedTags.size}</span>
            <span>Pendientes: {visibleSuggestions.length - acceptedTags.size}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}