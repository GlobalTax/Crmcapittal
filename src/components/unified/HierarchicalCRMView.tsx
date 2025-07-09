import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Users, Building2, FileText, Target, ArrowLeft } from 'lucide-react';

// Import existing components
import { LeadControlCenter } from '@/components/leads/LeadControlCenter';
import { RecordTable } from '@/components/companies/RecordTable';
import { MandatesTable } from '@/components/mandates/MandatesTable';
import { MandateTargetPipeline } from '@/components/mandates/MandateTargetPipeline';
import { TargetDetailPanel } from '@/components/mandates/TargetDetailPanel';

// Import new collapsible panels
import { CollapsibleLeadPanel } from './CollapsibleLeadPanel';
import { CollapsibleCompanyPanel } from './CollapsibleCompanyPanel';
import { CollapsibleMandatePanel } from './CollapsibleMandatePanel';
import { CollapsibleTargetPanel } from './CollapsibleTargetPanel';

// Import hooks
import { useCompanies } from '@/hooks/useCompanies';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

// Import types
import { Company } from '@/types/Company';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { Lead } from '@/types/Lead';

type NavigationLevel = 'leads' | 'companies' | 'mandates' | 'targets';

interface NavigationState {
  level: NavigationLevel;
  selectedCompany?: Company;
  selectedMandate?: BuyingMandate;
  selectedTarget?: MandateTarget;
  selectedLead?: Lead;
}

interface HierarchicalCRMViewProps {
  initialLevel?: NavigationLevel;
  companyId?: string;
  mandateId?: string;
  targetId?: string;
}

export const HierarchicalCRMView = ({ 
  initialLevel = 'leads',
  companyId,
  mandateId,
  targetId 
}: HierarchicalCRMViewProps) => {
  const [navigation, setNavigation] = useState<NavigationState>({
    level: initialLevel
  });
  const [showTargetDetail, setShowTargetDetail] = useState(false);

  // Hooks
  const { companies, createCompany, updateCompany, deleteCompany, isLoading: companiesLoading } = useCompanies({
    page: 1,
    limit: 50,
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  });

  const { 
    mandates, 
    targets, 
    documents,
    fetchMandates, 
    fetchTargets, 
    fetchDocuments,
    isLoading: mandatesLoading 
  } = useBuyingMandates();

  // Load initial data
  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  // Load targets when mandate is selected
  useEffect(() => {
    if (navigation.selectedMandate?.id) {
      fetchTargets(navigation.selectedMandate.id);
      fetchDocuments(navigation.selectedMandate.id);
    }
  }, [navigation.selectedMandate?.id, fetchTargets, fetchDocuments]);

  // Navigation handlers
  const handleNavigateToCompanies = (company?: Company) => {
    setNavigation({
      level: 'companies',
      selectedCompany: company
    });
  };

  const handleNavigateToMandates = (mandate?: BuyingMandate) => {
    setNavigation({
      ...navigation,
      level: 'mandates',
      selectedMandate: mandate
    });
  };

  const handleNavigateToTargets = (mandate: BuyingMandate) => {
    setNavigation({
      ...navigation,
      level: 'targets',
      selectedMandate: mandate
    });
  };

  const handleTargetClick = (target: MandateTarget) => {
    setNavigation({
      ...navigation,
      selectedTarget: target
    });
    setShowTargetDetail(true);
  };

  const handleBackNavigation = () => {
    switch (navigation.level) {
      case 'targets':
        setNavigation({
          ...navigation,
          level: 'mandates',
          selectedTarget: undefined
        });
        break;
      case 'mandates':
        setNavigation({
          ...navigation,
          level: 'companies',
          selectedMandate: undefined
        });
        break;
      case 'companies':
        setNavigation({
          level: 'leads'
        });
        break;
    }
  };

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      { level: 'leads', label: 'Leads', icon: Users },
      { level: 'companies', label: 'Empresas', icon: Building2 },
      { level: 'mandates', label: 'Mandatos', icon: FileText },
      { level: 'targets', label: 'Targets', icon: Target }
    ];

    const currentIndex = items.findIndex(item => item.level === navigation.level);
    return items.slice(0, currentIndex + 1);
  };

  const getContextualInfo = () => {
    const info = [];
    if (navigation.selectedCompany) {
      info.push(`Empresa: ${navigation.selectedCompany.name}`);
    }
    if (navigation.selectedMandate) {
      info.push(`Mandato: ${navigation.selectedMandate.mandate_name}`);
    }
    if (navigation.selectedTarget) {
      info.push(`Target: ${navigation.selectedTarget.company_name}`);
    }
    return info;
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {navigation.level !== 'leads' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackNavigation}
                className="h-8 px-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Breadcrumb>
              <BreadcrumbList>
                {getBreadcrumbItems().map((item, index) => {
                  const Icon = item.icon;
                  const isLast = index === getBreadcrumbItems().length - 1;
                  
                  return (
                    <div key={item.level} className="flex items-center">
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="flex items-center space-x-1">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            className="flex items-center space-x-1 cursor-pointer"
                            onClick={() => setNavigation({ level: item.level as NavigationLevel })}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </div>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Contextual Information */}
          {getContextualInfo().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getContextualInfo().map((info, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {info}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation Tabs */}
        <Tabs 
          value={navigation.level} 
          onValueChange={(value) => setNavigation({ level: value as NavigationLevel })}
          className="w-auto"
        >
          <TabsList className="grid grid-cols-4 w-auto">
            <TabsTrigger value="leads" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="mandates" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Mandatos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="targets" 
              disabled={!navigation.selectedMandate}
              className="flex items-center space-x-1"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Targets</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <Tabs value={navigation.level} className="w-full">
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Control de Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadControlCenter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Gestión de Empresas</span>
                </div>
                <Button onClick={() => handleNavigateToMandates()}>
                  Ver Mandatos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {navigation.selectedCompany ? (
                <CollapsibleCompanyPanel
                  company={navigation.selectedCompany}
                  onEdit={(company) => {
                    // TODO: Implement edit dialog
                    console.log('Edit company:', company);
                  }}
                />
              ) : (
                <RecordTable
                  companies={companies}
                  totalCount={companies.length}
                  onRowClick={handleNavigateToCompanies}
                  onCreateCompany={() => {}}
                  onSearch={() => {}}
                  onFilter={() => {}}
                  isLoading={companiesLoading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mandates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Mandatos de Compra</span>
                  {navigation.selectedCompany && (
                    <Badge variant="outline">
                      {navigation.selectedCompany.name}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {navigation.selectedMandate ? (
                <CollapsibleMandatePanel
                  mandate={navigation.selectedMandate}
                  onEdit={(mandate) => {
                    // TODO: Implement edit dialog
                    console.log('Edit mandate:', mandate);
                  }}
                />
              ) : (
                <div className="grid gap-4">
                  {mandates.map((mandate) => (
                    <CollapsibleMandatePanel
                      key={mandate.id}
                      mandate={mandate}
                      onEdit={(mandate) => {
                        // TODO: Implement edit dialog
                        console.log('Edit mandate:', mandate);
                      }}
                    />
                  ))}
                  {mandates.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No hay mandatos disponibles
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          {navigation.selectedMandate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Targets - {navigation.selectedMandate.mandate_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {targets.length} targets
                    </Badge>
                    <Badge variant="secondary">
                      {targets.filter(t => t.contacted).length} contactados
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {navigation.selectedTarget ? (
                  <CollapsibleTargetPanel
                    target={navigation.selectedTarget}
                    onEdit={(target) => {
                      // TODO: Implement edit dialog
                      console.log('Edit target:', target);
                    }}
                    onUpdate={(target) => {
                      if (navigation.selectedMandate?.id) {
                        fetchTargets(navigation.selectedMandate.id);
                      }
                    }}
                  />
                ) : (
                  <div className="grid gap-4">
                    {targets.map((target) => (
                      <CollapsibleTargetPanel
                        key={target.id}
                        target={target}
                        onEdit={(target) => {
                          // TODO: Implement edit dialog
                          console.log('Edit target:', target);
                        }}
                        onUpdate={(target) => {
                          if (navigation.selectedMandate?.id) {
                            fetchTargets(navigation.selectedMandate.id);
                          }
                        }}
                      />
                    ))}
                    {targets.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No hay targets para este mandato
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">Selecciona un Mandato</h3>
                    <p className="text-muted-foreground">
                      Primero selecciona un mandato para ver sus targets relacionados
                    </p>
                  </div>
                  <Button onClick={() => setNavigation({ level: 'mandates' })}>
                    Ir a Mandatos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Target Detail Panel */}
      <TargetDetailPanel
        target={navigation.selectedTarget}
        documents={documents}
        open={showTargetDetail}
        onOpenChange={setShowTargetDetail}
        onTargetUpdate={() => {
          if (navigation.selectedMandate?.id) {
            fetchTargets(navigation.selectedMandate.id);
          }
        }}
        onDocumentUploaded={() => {
          if (navigation.selectedMandate?.id) {
            fetchDocuments(navigation.selectedMandate.id);
          }
        }}
      />
    </div>
  );
};