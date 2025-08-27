import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Users, 
  Globe, 
  MapPin, 
  Calendar,
  ArrowRight,
  Merge,
  X,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/productionLogger';

interface Company {
  id: string;
  name: string;
  domain?: string;
  nif?: string;
  industry?: string;
  annual_revenue?: number;
  company_size?: string;
  country?: string;
  city?: string;
  created_at: string;
  contacts_count?: number;
}

interface DuplicateGroup {
  primary: Company;
  duplicates: Company[];
  reason: 'domain' | 'nif' | 'name';
}

interface DuplicateCompaniesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved?: () => void;
}

export function DuplicateCompaniesModal({ 
  open, 
  onOpenChange, 
  onResolved 
}: DuplicateCompaniesModalProps) {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState<string | null>(null);

  const findDuplicates = async () => {
    setIsLoading(true);
    try {
      // Buscar duplicados por dominio, NIF y nombre similar
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          domain,
          nif,
          industry,
          annual_revenue,
          company_size,
          country,
          city,
          created_at,
          contacts:contacts(count)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groups: DuplicateGroup[] = [];
      const processed = new Set<string>();

      // Agrupar por dominio
      const domainGroups = new Map<string, Company[]>();
      companies?.forEach(company => {
        if (company.domain && !processed.has(company.id)) {
          if (!domainGroups.has(company.domain)) {
            domainGroups.set(company.domain, []);
          }
          domainGroups.get(company.domain)?.push({
            ...company,
            contacts_count: company.contacts?.[0]?.count || 0
          });
        }
      });

      domainGroups.forEach((companyList, domain) => {
        if (companyList.length > 1) {
          const [primary, ...duplicates] = companyList.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          groups.push({ primary, duplicates, reason: 'domain' });
          companyList.forEach(c => processed.add(c.id));
        }
      });

      // Agrupar por NIF
      const nifGroups = new Map<string, Company[]>();
      companies?.forEach(company => {
        if (company.nif && !processed.has(company.id)) {
          if (!nifGroups.has(company.nif)) {
            nifGroups.set(company.nif, []);
          }
          nifGroups.get(company.nif)?.push({
            ...company,
            contacts_count: company.contacts?.[0]?.count || 0
          });
        }
      });

      nifGroups.forEach((companyList, nif) => {
        if (companyList.length > 1) {
          const [primary, ...duplicates] = companyList.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          groups.push({ primary, duplicates, reason: 'nif' });
          companyList.forEach(c => processed.add(c.id));
        }
      });

      setDuplicateGroups(groups);
    } catch (error) {
      logger.error('Failed to find duplicate companies', { 
        error: error instanceof Error ? error.message : error 
      });
      toast.error('Error buscando duplicados');
    } finally {
      setIsLoading(false);
    }
  };

  const mergeCompanies = async (group: DuplicateGroup) => {
    setIsMerging(group.primary.id);
    try {
      // Mover todos los contactos a la empresa principal
      for (const duplicate of group.duplicates) {
        await supabase
          .from('contacts')
          .update({ company_id: group.primary.id })
          .eq('company_id', duplicate.id);

        // Mover otros datos relacionados si existen
        await supabase
          .from('leads')
          .update({ company_id: group.primary.id })
          .eq('company_id', duplicate.id);
      }

      // Eliminar las empresas duplicadas
      const duplicateIds = group.duplicates.map(d => d.id);
      await supabase
        .from('companies')
        .delete()
        .in('id', duplicateIds);

      // Actualizar el estado local
      setDuplicateGroups(prev => prev.filter(g => g.primary.id !== group.primary.id));
      
      toast.success(`Se fusionaron ${group.duplicates.length + 1} empresas duplicadas`);
    } catch (error) {
      logger.error('Failed to merge duplicate companies', { 
        error: error instanceof Error ? error.message : error, 
        primaryCompanyId: group.primary.id, 
        primaryCompanyName: group.primary.name, 
        duplicateCount: group.duplicates.length 
      });
      toast.error('Error fusionando empresas');
    } finally {
      setIsMerging(null);
    }
  };

  const dismissGroup = (groupId: string) => {
    setDuplicateGroups(prev => prev.filter(g => g.primary.id !== groupId));
  };

  useEffect(() => {
    if (open) {
      findDuplicates();
    }
  }, [open]);

  const getReason = (reason: string) => {
    switch (reason) {
      case 'domain': return 'Mismo dominio';
      case 'nif': return 'Mismo NIF';
      case 'name': return 'Nombre similar';
      default: return 'Duplicado';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'domain': return 'bg-blue-100 text-blue-800';
      case 'nif': return 'bg-purple-100 text-purple-800';
      case 'name': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Empresas Duplicadas Detectadas
          </DialogTitle>
          <DialogDescription>
            Se han encontrado {duplicateGroups.length} grupos de empresas duplicadas. 
            Puedes fusionarlas para mantener la base de datos limpia.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Buscando duplicados...</p>
            </div>
          </div>
        ) : duplicateGroups.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700">¡Todo limpio!</p>
            <p className="text-sm text-muted-foreground">No se encontraron empresas duplicadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {duplicateGroups.map((group, index) => (
              <Card key={group.primary.id} className="border-l-4 border-l-orange-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn("text-xs", getReasonColor(group.reason))}>
                      {getReason(group.reason)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissGroup(group.primary.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Empresa principal */}
                    <div className="lg:col-span-1">
                      <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="text-xs">Principal</Badge>
                          <span className="text-xs text-muted-foreground">
                            {group.primary.contacts_count || 0} contactos
                          </span>
                        </div>
                        <CompanyCard company={group.primary} />
                      </div>
                    </div>

                    {/* Flecha */}
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Empresas duplicadas */}
                    <div className="lg:col-span-1 space-y-2">
                      {group.duplicates.map((duplicate) => (
                        <div key={duplicate.id} className="border rounded-lg p-3 bg-red-50 border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs">Duplicada</Badge>
                            <span className="text-xs text-muted-foreground">
                              {duplicate.contacts_count || 0} contactos
                            </span>
                          </div>
                          <CompanyCard company={duplicate} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Los contactos de las empresas duplicadas se moverán a la empresa principal
                    </p>
                    <Button
                      onClick={() => mergeCompanies(group)}
                      disabled={isMerging === group.primary.id}
                      className="flex items-center gap-2"
                    >
                      <Merge className="h-4 w-4" />
                      {isMerging === group.primary.id ? 'Fusionando...' : 'Fusionar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {duplicateGroups.length === 0 && onResolved && (
            <Button onClick={onResolved}>
              Continuar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm truncate">{company.name}</h4>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        {company.domain && (
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span className="truncate">{company.domain}</span>
          </div>
        )}
        
        {company.nif && (
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span>{company.nif}</span>
          </div>
        )}
        
        {company.industry && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="truncate">{company.industry}</span>
          </div>
        )}
        
        {(company.city || company.country) && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {[company.city, company.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(company.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}