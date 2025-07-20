
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CompanyHeader } from '@/components/companies/CompanyHeader';
import { CompanyOverviewTab } from '@/components/companies/CompanyOverviewTab';
import { CompanyTimeline } from '@/components/companies/CompanyTimeline';
import { CompanyContactsTab } from '@/components/companies/CompanyContactsTab';
import { CompanyDealsTab } from '@/components/companies/CompanyDealsTab';
import { CompanyNotesSection } from '@/components/companies/CompanyNotesSection';
import { CompanyFilesTab } from '@/components/companies/CompanyFilesTab';
import { CompanyEinformaTab } from '@/components/companies/CompanyEinformaTab';
import { CompanyDocumentsTab } from '@/components/companies/CompanyDocumentsTab';
import { CompanyRecordSidebar } from '@/components/companies/CompanyRecordSidebar';
import { EditCompanyDialog } from '@/components/companies/EditCompanyDialog';
import { useCompany } from '@/hooks/useCompany';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/Company';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useState } from 'react';

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  console.log("🔍 CompanyPage rendered with ID:", id);

  const { data: company, isLoading, error } = useCompany(id);
  const { updateCompany, isUpdating } = useCompanies();

  // Set document title when company loads
  useEffect(() => {
    if (company) {
      document.title = `Empresa • ${company.name}`;
      console.log("📄 Document title set for:", company.name);
    }
    return () => {
      document.title = 'Empresas';
    };
  }, [company]);

  // Scroll to top when company changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleUpdateCompany = (companyId: string, companyData: any) => {
    console.log("🔄 Updating company:", companyId, companyData);
    updateCompany({ id: companyId, ...companyData });
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    console.log("✏️ Editing company:", company.name);
    setEditingCompany(company);
  };

  if (isLoading) {
    console.log("⏳ Company loading...");
    return <LoadingSkeleton />;
  }

  if (error) {
    console.error("❌ Company error:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Error al cargar la empresa</p>
          <Button onClick={() => navigate('/empresas')}>
            Volver a empresas
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    console.warn("⚠️ Company not found for ID:", id);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Empresa no encontrada</p>
          <Button onClick={() => navigate('/empresas')}>
            Volver a empresas
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ Company loaded successfully:", company.name);

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <CompanyHeader
          company={company}
          onEdit={handleEdit}
          onPrevious={() => navigate('/empresas')}
          onNext={() => navigate('/empresas')}
          hasPrevious={false}
          hasNext={false}
        />

        {/* Tabs Navigation */}
        <div className="border-b border-border bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto p-0 bg-transparent">
              <div className="flex overflow-x-auto">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Actividad
                </TabsTrigger>
                <TabsTrigger 
                  value="contacts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Contactos
                </TabsTrigger>
                <TabsTrigger 
                  value="deals"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Oportunidades
                </TabsTrigger>
                 <TabsTrigger 
                   value="notes"
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                 >
                   Notas
                 </TabsTrigger>
                 <TabsTrigger 
                   value="files"
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                 >
                   Archivos
                 </TabsTrigger>
                 <TabsTrigger 
                   value="einforma"
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                 >
                   Datos eInforma
                 </TabsTrigger>
                 <TabsTrigger 
                   value="documents"
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                 >
                   Documentos
                 </TabsTrigger>
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <CompanyOverviewTab company={company} />
                </TabsContent>
                
                 <TabsContent value="activity" className="mt-0 p-6">
                   <CompanyTimeline company={company} />
                 </TabsContent>
                 
                 <TabsContent value="contacts" className="mt-0 p-6">
                   <CompanyContactsTab company={company} />
                 </TabsContent>
                 
                 <TabsContent value="deals" className="mt-0 p-6">
                   <CompanyDealsTab company={company} />
                 </TabsContent>
                 
                 <TabsContent value="notes" className="mt-0 p-6">
                   <CompanyNotesSection company={company} />
                 </TabsContent>
                 
                 <TabsContent value="files" className="mt-0 p-6">
                   <CompanyFilesTab company={company} />
                 </TabsContent>
                 
                 <TabsContent value="einforma" className="mt-0 p-6">
                   <CompanyEinformaTab company={company} />
                 </TabsContent>
                 
                 <TabsContent value="documents" className="mt-0 p-6">
                   <CompanyDocumentsTab company={company} />
                 </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, collapsible on tablet */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <CompanyRecordSidebar company={company} onEdit={handleEdit} />
      </div>

      {/* Mobile Details Button */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <Button
          onClick={() => setActiveTab(activeTab === 'details' ? 'overview' : 'details')}
          className="rounded-full shadow-lg"
        >
          {activeTab === 'details' ? 'Cerrar Detalles' : 'Mostrar Detalles'}
        </Button>
      </div>

      {/* Mobile Details Panel */}
      {activeTab === 'details' && (
        <div className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Detalles de la Empresa</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <CompanyRecordSidebar company={company} onEdit={handleEdit} />
        </div>
      )}

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
    </div>
  );
}
