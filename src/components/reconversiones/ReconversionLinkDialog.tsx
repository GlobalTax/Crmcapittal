import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Link, User, Building } from 'lucide-react';
import { useReconversionRelations } from '@/hooks/useReconversionRelations';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];
type BuyingMandate = Database['public']['Tables']['buying_mandates']['Row'];

interface ReconversionLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reconversionId: string;
  reconversionName: string;
  type: 'lead' | 'mandate';
  onLinked?: () => void;
}

export const ReconversionLinkDialog = ({
  open,
  onOpenChange,
  reconversionId,
  reconversionName,
  type,
  onLinked
}: ReconversionLinkDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Lead | BuyingMandate)[]>([]);
  const [linking, setLinking] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { 
    searchAvailableLeads, 
    searchAvailableMandates, 
    linkToLead, 
    linkToMandate 
  } = useReconversionRelations();

  // Buscar entidades cuando cambie la consulta
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        let results: (Lead | BuyingMandate)[];
        if (type === 'lead') {
          results = await searchAvailableLeads(debouncedSearchQuery);
        } else {
          results = await searchAvailableMandates(debouncedSearchQuery);
        }
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching:', error);
        toast.error('Error al buscar');
      }
    };

    performSearch();
  }, [debouncedSearchQuery, type, searchAvailableLeads, searchAvailableMandates]);

  const handleLink = async (entityId: string, entityName: string) => {
    try {
      setLinking(true);
      
      if (type === 'lead') {
        await linkToLead(reconversionId, entityId);
      } else {
        await linkToMandate(reconversionId, entityId);
      }
      
      toast.success(`Reconversión vinculada exitosamente con ${entityName}`);
      onLinked?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error linking:', error);
      toast.error('Error al vincular');
    } finally {
      setLinking(false);
    }
  };

  const getEntityName = (entity: Lead | BuyingMandate) => {
    if (type === 'lead') {
      const lead = entity as Lead;
      return lead.name || lead.company_name || 'Sin nombre';
    } else {
      const mandate = entity as BuyingMandate;
      return mandate.mandate_name || mandate.client_name || 'Sin nombre';
    }
  };

  const getEntitySubtitle = (entity: Lead | BuyingMandate) => {
    if (type === 'lead') {
      const lead = entity as Lead;
      return lead.email || lead.company_name || '';
    } else {
      const mandate = entity as BuyingMandate;
      return mandate.client_name || mandate.target_sectors?.join(', ') || '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular con {type === 'lead' ? 'Lead' : 'Mandato'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Reconversión:</strong> {reconversionName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Se vinculará con el {type === 'lead' ? 'lead' : 'mandato'} seleccionado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">
              Buscar {type === 'lead' ? 'Lead' : 'Mandato'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={`Buscar por nombre, email${type === 'mandate' ? ', cliente' : ''}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.length === 0 && debouncedSearchQuery.trim() ? (
              <p className="text-center py-8 text-muted-foreground">
                No se encontraron resultados
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Escribe para buscar {type === 'lead' ? 'leads' : 'mandatos'}
              </p>
            ) : (
              searchResults.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    {type === 'lead' ? (
                      <User className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Building className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{getEntityName(entity)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getEntitySubtitle(entity)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {entity.status || 'Sin estado'}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleLink(entity.id, getEntityName(entity))}
                      disabled={linking}
                    >
                      Vincular
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};