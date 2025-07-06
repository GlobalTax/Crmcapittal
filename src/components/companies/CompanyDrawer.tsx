import { useState, useEffect } from 'react';
import { X, Star, StarOff, ChevronLeft, ChevronRight, Mail, Copy, FileText, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Company } from '@/types/Company';
import { CompanyOverviewTab } from './CompanyOverviewTab';
import { CompanyActivityTab } from './CompanyActivityTab';
import { CompanyRecordSidebar } from './CompanyRecordSidebar';
import { einformaService } from '@/services/einformaService';
import { toast } from 'sonner';

interface CompanyDrawerProps {
  company: Company | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  // Navigation props
  companies?: Company[];
  currentIndex?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export const CompanyDrawer = ({
  company,
  open,
  onClose,
  onEdit,
  onDelete,
  companies = [],
  currentIndex = 0,
  onNavigate
}: CompanyDrawerProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEinformaDialog, setShowEinformaDialog] = useState(false);
  const [isEnrichingFromEinforma, setIsEnrichingFromEinforma] = useState(false);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Navigation with arrow keys
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        e.preventDefault();
        onNavigate('prev');
      }
      if (e.key === 'ArrowRight' && onNavigate && currentIndex < companies.length - 1) {
        e.preventDefault();
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onNavigate, currentIndex, companies.length]);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleAction = (action: string) => {
    if (!company) return;
    
    switch (action) {
      case 'compose-email':
        toast.info('Opening email composer...');
        break;
      case 'copy-link':
        navigator.clipboard.writeText(`${window.location.origin}/companies/${company.id}`);
        toast.success('Company link copied to clipboard');
        break;
      case 'clone':
        toast.info('Clone company functionality coming soon');
        break;
      case 'delete':
        if (window.confirm(`¿Estás seguro de que deseas eliminar ${company.name}?`)) {
          onDelete?.(company.id);
          onClose();
        }
        break;
    }
  };

  const handleEinformaEnrichment = async () => {
    if (!company || !(company as any).nif) return;
    
    setIsEnrichingFromEinforma(true);
    setShowEinformaDialog(false);
    
    try {
      const result = await einformaService.enrichCompanyWithEInforma((company as any).nif);
      
      if (result.success) {
        toast.success(result.message);
        // Trigger a refresh of the company data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message || 'Error al consultar eInforma');
      }
    } catch (error) {
      console.error('Error enriching company:', error);
      toast.error('Error inesperado al consultar eInforma');
    } finally {
      setIsEnrichingFromEinforma(false);
    }
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
        className={`fixed right-0 top-0 h-full bg-neutral-0 border-l border-border shadow-lg z-50 transform transition-transform duration-300 
          ${open ? 'translate-x-0' : 'translate-x-full'}
          w-[480px] max-w-[480px]
          md:w-[480px]
          max-md:w-full max-md:left-0
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-muted text-xs">
                  {getInitials(company.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg truncate">{company.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              
              {/* Navigation */}
              {companies.length > 1 && onNavigate && (
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('prev')}
                    disabled={currentIndex <= 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {currentIndex + 1} / {companies.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('next')}
                    disabled={currentIndex >= companies.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Global Actions */}
            <div className="flex items-center gap-1 ml-4">
              {/* eInforma Button - Only show if company has NIF */}
              {(company as any).nif && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEinformaDialog(true)}
                    disabled={isEnrichingFromEinforma}
                    className="h-8 w-8 p-0"
                    title="Actualizar desde eInforma"
                  >
                    {isEnrichingFromEinforma ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('compose-email')}
                className="h-8 w-8 p-0"
                title="Compose email"
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('copy-link')}
                className="h-8 w-8 p-0"
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('clone')}
                className="h-8 w-8 p-0"
                title="Clone company"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('delete')}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete company"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
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

      {/* eInforma Confirmation Dialog */}
      <AlertDialog open={showEinformaDialog} onOpenChange={setShowEinformaDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Consultar eInforma</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas usar un crédito para consultar eInforma para esta empresa?
              <br />
              <br />
              Esto actualizará la información de <strong>{company.name}</strong> con datos del registro mercantil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEinformaEnrichment}>
              {isEnrichingFromEinforma ? 'Consultando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};