import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LeadHeader } from '@/components/leads/LeadHeader';
import { LeadOverviewTab } from '@/components/leads/LeadOverviewTab';
import { LeadActivityTab } from '@/components/leads/LeadActivityTab';
import { LeadDetailsSidebar } from '@/components/leads/LeadDetailsSidebar';
import { LeadNotesTab } from '@/components/leads/LeadNotesTab';
import { LeadTasksTab } from '@/components/leads/LeadTasksTab';
import { LeadFilesTab } from '@/components/leads/LeadFilesTab';
import { LeadEmailsTab } from '@/components/leads/LeadEmailsTab';
import { useLeads, useLead } from '@/hooks/useLeads';
import { Lead, UpdateLeadData } from '@/types/Lead';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function LeadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { lead, isLoading: leadLoading } = useLead(id || '');
  const { leads, isLoading: leadsLoading, updateLead } = useLeads();
  
  const isLoading = leadLoading || leadsLoading;

  // Handle legacy URL redirections (from drawer URLs)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/leads/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Find the lead and set document title
  useEffect(() => {
    if (lead) {
      document.title = `Lead • ${lead.name}`;
    } else if (!isLoading && id) {
      // Lead not found, redirect to leads list
      navigate('/leads', { replace: true });
    }
  }, [lead, id, navigate, isLoading]);

  // Scroll to top when lead changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Leads';
    };
  }, []);

  const handleUpdateLead = async (leadId: string, leadData: UpdateLeadData) => {
    try {
      updateLead({ id: leadId, updates: leadData });
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  // Navigation between leads
  const getCurrentLeadIndex = () => {
    if (!leads || !lead) return -1;
    return leads.findIndex(l => l.id === lead.id);
  };

  const handlePrevious = () => {
    if (!leads) return;
    const currentIndex = getCurrentLeadIndex();
    if (currentIndex > 0) {
      const previousLead = leads[currentIndex - 1];
      navigate(`/leads/${previousLead.id}`);
    }
  };

  const handleNext = () => {
    if (!leads) return;
    const currentIndex = getCurrentLeadIndex();
    if (currentIndex < leads.length - 1) {
      const nextLead = leads[currentIndex + 1];
      navigate(`/leads/${nextLead.id}`);
    }
  };

  const currentIndex = getCurrentLeadIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = leads ? currentIndex < leads.length - 1 : false;

  // Check if lead has been converted (has deals/transactions)
  const hasTransactions = lead?.converted_to_deal_id || lead?.status === 'CONVERTED';

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <LeadHeader
          lead={lead}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
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
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="emails"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Emails
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="files"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Files
                </TabsTrigger>
                {/* Conditional Transactions tab */}
                {hasTransactions && (
                  <TabsTrigger 
                    value="transactions"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                  >
                    Transacciones
                  </TabsTrigger>
                )}
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <LeadOverviewTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 p-6">
                  <LeadActivityTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="emails" className="mt-0 p-6">
                  <LeadEmailsTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-0 p-6">
                  <LeadTasksTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 p-6">
                  <LeadNotesTab lead={lead} />
                </TabsContent>
                
                <TabsContent value="files" className="mt-0 p-6">
                  <LeadFilesTab lead={lead} />
                </TabsContent>

                {hasTransactions && (
                  <TabsContent value="transactions" className="mt-0 p-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Transaction history coming soon</p>
                    </div>
                  </TabsContent>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, collapsible on tablet */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <LeadDetailsSidebar lead={lead} onUpdate={handleUpdateLead} />
      </div>

      {/* Mobile Details Button */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <Button
          onClick={() => setActiveTab(activeTab === 'details' ? 'overview' : 'details')}
          className="rounded-full shadow-lg"
        >
          {activeTab === 'details' ? 'Close Details' : 'Show Details'}
        </Button>
      </div>

      {/* Mobile Details Panel */}
      {activeTab === 'details' && (
        <div className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Lead Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <LeadDetailsSidebar lead={lead} onUpdate={handleUpdateLead} />
        </div>
      )}
    </div>
  );
}