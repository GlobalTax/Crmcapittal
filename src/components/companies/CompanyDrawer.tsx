import { useState, useEffect } from 'react';
import { X, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Company } from '@/types/Company';
import { CompanyOverviewTab } from './CompanyOverviewTab';
import { CompanyActivityTab } from './CompanyActivityTab';
import { CompanyRecordSidebar } from './CompanyRecordSidebar';

interface CompanyDrawerProps {
  company: Company | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (company: Company) => void;
}

export const CompanyDrawer = ({
  company,
  open,
  onClose,
  onEdit
}: CompanyDrawerProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Focus trap and escape key handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (!company) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-neutral-0 border-l border-border shadow-lg z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs">
                  {getInitials(company.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{company.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-6 w-6 p-0"
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-auto p-0 bg-transparent">
                <div className="flex overflow-x-auto">
                  <TabsTrigger 
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emails"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Emails
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calls"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Calls
                  </TabsTrigger>
                  <TabsTrigger 
                    value="team"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Team
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger 
                    value="files"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Files
                  </TabsTrigger>
                </div>
              </TabsList>

              {/* Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="overview" className="mt-0 p-6">
                    <CompanyOverviewTab company={company} />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0 p-6">
                    <CompanyActivityTab company={company} />
                  </TabsContent>
                  
                  <TabsContent value="emails" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Email integration coming soon</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="calls" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Call logging coming soon</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="team" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Team management coming soon</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Notes coming soon</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Task management coming soon</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="files" className="mt-0 p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">File management coming soon</p>
                    </div>
                  </TabsContent>
                </div>

                {/* Sidebar */}
                <div className="w-64 border-l border-border bg-neutral-50 overflow-y-auto">
                  <CompanyRecordSidebar company={company} onEdit={onEdit} />
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};