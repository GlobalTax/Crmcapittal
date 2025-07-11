import { SimpleLeadManagement } from '@/components/leads/SimpleLeadManagement';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HubSpotImport } from '@/components/import/HubSpotImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeadsEntryPanel() {
  return (
    <ErrorBoundary>
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
          <TabsTrigger value="import">Importar HubSpot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          <SimpleLeadManagement />
        </TabsContent>
        
        <TabsContent value="import">
          <HubSpotImport />
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
}