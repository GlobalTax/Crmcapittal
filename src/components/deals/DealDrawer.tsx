import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Deal } from '@/types/Deal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Copy, 
  FileText, 
  Trash2, 
  X, 
  Activity, 
  StickyNote, 
  CheckSquare, 
  Users 
} from 'lucide-react';
import { DealOverviewTab } from './tabs/DealOverviewTab';
import { DealActivityTab } from './tabs/DealActivityTab';
import { DealNotesTab } from './tabs/DealNotesTab';
import { DealTasksTab } from './tabs/DealTasksTab';
import { DealPeopleTab } from './tabs/DealPeopleTab';
import { DealRecordSidebar } from './DealRecordSidebar';
import { toast } from 'sonner';
import './deals-styles.css';

interface DealDrawerProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageUpdate?: (dealId: string, newStage: string) => void;
}

export const DealDrawer = ({ deal, open, onOpenChange, onStageUpdate }: DealDrawerProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activityCount] = useState(2); // Mock count
  const [notesCount] = useState(0); // Mock count
  const [tasksCount] = useState(0); // Mock count
  const [peopleCount] = useState(1); // Mock count

  // Update deal stage optimistically when drag & drop occurs
  useEffect(() => {
    // This would be called from the parent when a deal stage is updated
    // The parent component would handle the optimistic update
  }, [deal?.stage]);

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'compose-email':
        toast.info('Email composer would open here');
        break;
      case 'copy-link':
        if (deal) {
          navigator.clipboard.writeText(`${window.location.origin}/deals/${deal.id}`);
          toast.success('Deal link copied to clipboard');
        }
        break;
      case 'clone':
        toast.info('Clone deal functionality would open here');
        break;
      case 'delete':
        toast.info('Delete confirmation would appear here');
        break;
    }
  };

  // Handle body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [open]);

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="drawer-deal p-0 gap-0 bg-background border-l border-border"
        aria-labelledby="deal-drawer-title"
      >
        {/* Header with title and actions */}
        <div className="header-deal flex items-center justify-between border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 
              id="deal-drawer-title"
              className="text-lg font-semibold text-foreground truncate"
              tabIndex={-1}
            >
              {deal.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStageColor(deal.stage) }}
              />
              <Badge variant="secondary" className="text-xs">
                {deal.stage}
              </Badge>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('compose-email')}
              className="btn-icon"
              aria-label="Compose email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('copy-link')}
              className="btn-icon"
              aria-label="Copy deal link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('clone')}
              className="btn-icon"
              aria-label="Clone deal"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick('delete')}
              className="btn-icon text-destructive hover:text-destructive"
              aria-label="Delete deal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="btn-icon ml-2"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content area with two columns */}
        <div className="flex h-[calc(100vh-89px)]">
          {/* Main content column (70%) */}
          <div className="flex-[0.7] border-r border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              {/* Tabs navigation */}
              <div className="tablist-deal border-b border-border">
                <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger 
                    value="overview"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    Activity
                    {activityCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                        {activityCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    Notes
                    {notesCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                        {notesCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    Tasks
                    {tasksCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                        {tasksCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="people"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-sm"
                  >
                    People
                    {peopleCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                        {peopleCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab content with scroll */}
              <div className="flex-1 overflow-y-auto">
                <div className="section-main flex flex-col">
                  <TabsContent value="overview" className="mt-0">
                    <DealOverviewTab deal={deal} />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0">
                    <DealActivityTab deal={deal} />
                  </TabsContent>
                  
                  <TabsContent value="notes" className="mt-0">
                    <DealNotesTab deal={deal} />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-0">
                    <DealTasksTab deal={deal} />
                  </TabsContent>
                  
                  <TabsContent value="people" className="mt-0">
                    <DealPeopleTab deal={deal} />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Sidebar column (30%) */}
          <div className="flex-[0.3] bg-muted/50">
            <div className="sidebar-details">
              <DealRecordSidebar deal={deal} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  function getStageColor(stage: string) {
    const colors: Record<string, string> = {
      'Lead': '#1E88E5',
      'In Progress': '#FFB300',
      'Won': '#00C48C',
      'Lost': '#EF5350'
    };
    return colors[stage] || '#6B7280';
  }
};