import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHubSpotData } from '@/features/hubspot/hooks/useHubSpotData';
import { HubSpotSummary } from '@/features/hubspot/components/HubSpotSummary';
import { CompaniesTab } from '@/features/hubspot/components/CompaniesTab';
import { ContactsTab } from '@/features/hubspot/components/ContactsTab';
import { DealsTab } from '@/features/hubspot/components/DealsTab';
import { EmptyState } from '@/features/hubspot/components/EmptyState';

export function HubSpotDatabase() {
  const { data, loading, stats, fetchData } = useHubSpotData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos de HubSpot...</p>
        </div>
      </div>
    );
  }

  const hasData = stats.totalCompanies > 0 || stats.totalContacts > 0 || stats.totalDeals > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <HubSpotSummary stats={stats} loading={loading} onRefresh={fetchData} />
        <EmptyState onImport={() => window.location.href = '/captacion'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HubSpotSummary stats={stats} loading={loading} onRefresh={fetchData} />

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <CompaniesTab companies={data.companies} />
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-4">
          <ContactsTab contacts={data.contacts} />
        </TabsContent>
        
        <TabsContent value="deals" className="space-y-4">
          <DealsTab deals={data.deals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}