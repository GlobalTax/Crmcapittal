import { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickActionsHeader } from '@/components/companies/QuickActionsHeader';
import { EnrichedOverviewTab } from '@/components/companies/EnrichedOverviewTab';
import { CompanyContactsTab } from '@/components/companies/CompanyContactsTab';
import { CompanyDealsTab } from '@/components/companies/CompanyDealsTab';
import { IntegratedActivityTab } from '@/components/companies/IntegratedActivityTab';
import { CompanyAllDocumentsTab } from '@/components/companies/CompanyAllDocumentsTab';
import { CompanyFloatingActions } from '@/components/companies/CompanyFloatingActions';
import { EditCompanyDialog } from '@/components/companies/EditCompanyDialog';
import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog';
import { useCompanies } from '@/hooks/useCompanies';
import { useLeads } from '@/hooks/useLeads';
import { Company } from '@/types/Company';
import { CreateLeadData } from '@/types/Lead';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { AccountIntelligenceDashboard } from '@/components/companies/intelligence/AccountIntelligenceDashboard';

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [localLoading, setLocalLoading] = useState(true);
  const [showCreateLeadDialog, setShowCreateLeadDialog] = useState(false);
  
  const {
    companies,
    updateCompany,
    isLoading: companiesLoading,
    isUpdating
  } = useCompanies({ 
    page: 1, 
    limit: 1000,
    searchTerm: '', 
    statusFilter: 'all', 
    typeFilter: 'all' 
  });

  const { createLead, isCreating } = useLeads();

  // Handle legacy URL redirections (from drawer URLs)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/empresas/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Update loading state based on companies loading
  useEffect(() => {
    setLocalLoading(companiesLoading);
  }, [companiesLoading]);

  // Find the company once companies are loaded
  useEffect(() => {
    if (companies && id) {
      const foundCompany = companies.find(c => c.id === id);
      if (foundCompany) {
        setCompany(foundCompany);
        // Set document title
        document.title = `Empresa • ${foundCompany.name}`;
      } else if (!localLoading) {
        // Company not found, redirect to companies list
        navigate('/empresas', { replace: true });
      }
    }
  }, [companies, id, navigate, localLoading]);

  // Scroll to top when company changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Empresas';
    };
  }, []);

  const handleUpdateCompany = (companyId: string, companyData: any) => {
    updateCompany({ id: companyId, ...companyData });
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
  };

  const handleCreateLead = (leadData: CreateLeadData) => {
    // Pre-rellenar con datos de la empresa
    const leadWithCompany = {
      ...leadData,
      company: company?.name,
      company_id: company?.id,
    };
    
    createLead(leadWithCompany, {
      onSuccess: (result) => {
        setShowCreateLeadDialog(false);
        // Navegar al detalle del lead creado
        navigate(`/leads/${result.lead.id}`);
      }
    });
  };

  // Navigation between companies
  const getCurrentCompanyIndex = () => {
    if (!companies || !company) return -1;
    return companies.findIndex(c => c.id === company.id);
  };

  const handlePrevious = () => {
    if (!companies) return;
    const currentIndex = getCurrentCompanyIndex();
    if (currentIndex > 0) {
      const previousCompany = companies[currentIndex - 1];
      navigate(`/empresas/${previousCompany.id}`);
    }
  };

  const handleNext = () => {
    if (!companies) return;
    const currentIndex = getCurrentCompanyIndex();
    if (currentIndex < companies.length - 1) {
      const nextCompany = companies[currentIndex + 1];
      navigate(`/empresas/${nextCompany.id}`);
    }
  };

  const currentIndex = getCurrentCompanyIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = companies ? currentIndex < companies.length - 1 : false;

  if (localLoading) {
    return <LoadingSkeleton />;
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Empresa no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Quick Actions Header */}
      <QuickActionsHeader
        company={company}
        onEdit={handleEdit}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onCreateLead={() => setShowCreateLeadDialog(true)}
        onCreateContact={() => console.log('Create contact')}
        onCreateNote={() => console.log('Create note')}
      />

      {/* Optimized Tabs (5 tabs only) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="max-w-6xl mx-auto">
            <TabsList className="h-auto p-0 bg-transparent justify-start">
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Contactos
              </TabsTrigger>
              <TabsTrigger 
                value="deals"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Deals
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Actividad
              </TabsTrigger>
              <TabsTrigger 
                value="intelligence"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Inteligencia
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
              >
                Documentos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content with max-width centering */}
        <div className="py-6">
          <TabsContent value="overview" className="mt-0">
            <Suspense fallback={<LoadingSkeleton />}>
              <EnrichedOverviewTab company={company} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="contacts" className="mt-0">
            <div className="max-w-6xl mx-auto px-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyContactsTab company={company} />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="deals" className="mt-0">
            <div className="max-w-6xl mx-auto px-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyDealsTab company={company} />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <Suspense fallback={<LoadingSkeleton />}>
              <IntegratedActivityTab company={company} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="intelligence" className="mt-0">
            <div className="max-w-6xl mx-auto px-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <AccountIntelligenceDashboard companyId={company.id} companyName={company.name} />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <Suspense fallback={<LoadingSkeleton />}>
              <CompanyAllDocumentsTab company={company} />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating Actions */}
      <CompanyFloatingActions
        company={company}
        hasContacts={true} // Esto debería venir de los stats reales
        onCall={() => console.log('Call action')}
        onEmail={() => console.log('Email action')}
        onQuickNote={() => console.log('Quick note')}
        onCreateLead={() => setShowCreateLeadDialog(true)}
      />

      {/* Edit Company Dialog */}
      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onUpdateCompany={handleUpdateCompany}
          isUpdating={isUpdating}
        />
      )}

      {/* Create Lead Dialog */}
      <CreateLeadDialog
        open={showCreateLeadDialog}
        onOpenChange={setShowCreateLeadDialog}
        onCreateLead={handleCreateLead}
        isCreating={isCreating}
      />
    </div>
  );
}