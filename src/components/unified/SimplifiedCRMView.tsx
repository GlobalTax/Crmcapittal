import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, FileText, Target, Plus } from 'lucide-react';
import { FloatingActionButton } from './FloatingActionButton';
import { QuickFilters } from './QuickFilters';
import { CRMTabContent } from './CRMTabContent';
import { useCRMMetrics } from '@/hooks/useCRMMetrics';

type CRMTab = 'leads' | 'companies' | 'mandates' | 'targets';

interface SimplifiedCRMViewProps {
  initialTab?: CRMTab;
}

export const SimplifiedCRMView = ({ initialTab = 'leads' }: SimplifiedCRMViewProps) => {
  const [activeTab, setActiveTab] = useState<CRMTab>(initialTab);
  const { metrics, isLoading: metricsLoading } = useCRMMetrics();

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as CRMTab);
  }, []);

  const getTabConfig = () => {
    return [
      {
        value: 'leads',
        label: 'Leads',
        icon: Users,
        count: metrics?.leadsCount || 0,
        color: 'bg-blue-50 text-blue-700'
      },
      {
        value: 'companies',
        label: 'Empresas', 
        icon: Building2,
        count: metrics?.companiesCount || 0,
        color: 'bg-green-50 text-green-700'
      },
      {
        value: 'mandates',
        label: 'Mandatos',
        icon: FileText,
        count: metrics?.mandatesCount || 0,
        color: 'bg-purple-50 text-purple-700'
      },
      {
        value: 'targets',
        label: 'Targets',
        icon: Target,
        count: metrics?.targetsCount || 0,
        color: 'bg-amber-50 text-amber-700'
      }
    ];
  };

  const getActionByTab = () => {
    switch (activeTab) {
      case 'leads':
        return { label: 'Nuevo Lead', action: () => window.location.href = '/leads/new' };
      case 'companies':
        return { label: 'Nueva Empresa', action: () => console.log('Create company') };
      case 'mandates':
        return { label: 'Nuevo Mandato', action: () => console.log('Create mandate') };
      case 'targets':
        return { label: 'Nuevo Target', action: () => console.log('Create target') };
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vista Unificada CRM</h1>
            <p className="text-sm text-gray-600">
              Gestiona todos tus datos comerciales desde una vista centralizada
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={getActionByTab().action}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {getActionByTab().label}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="h-auto p-1 bg-gray-100 w-full justify-start">
            {getTabConfig().map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-lg"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 ${tab.color} text-xs font-semibold`}
                  >
                    {metricsLoading ? '...' : tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Quick Filters */}
          <div className="mt-4">
            <QuickFilters activeTab={activeTab} />
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            <TabsContent value="leads" className="m-0">
              <CRMTabContent type="leads" />
            </TabsContent>
            
            <TabsContent value="companies" className="m-0">
              <CRMTabContent type="companies" />
            </TabsContent>
            
            <TabsContent value="mandates" className="m-0">
              <CRMTabContent type="mandates" />
            </TabsContent>
            
            <TabsContent value="targets" className="m-0">
              <CRMTabContent type="targets" />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        activeTab={activeTab}
        onAction={getActionByTab().action}
      />
    </div>
  );
};