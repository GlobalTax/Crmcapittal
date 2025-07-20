import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ContactHeader } from '@/components/contacts/ContactHeader';
import { PersonOverviewTab } from '@/components/contacts/PersonOverviewTab';
import { ContactTimeline } from '@/components/contacts/ContactTimeline';
import { PersonRecordSidebar } from '@/components/contacts/PersonRecordSidebar';
import { EditContactDialog } from '@/components/contacts/EditContactDialog';
import ContactFilesTab from '@/components/contacts/ContactFilesTab';
import { ContactTasksTab } from '@/components/contacts/ContactTasksTab';
import { ContactNotesTab } from '@/components/contacts/ContactNotesTab';
import { ContactCompanyTab } from '@/components/contacts/ContactCompanyTab';
import { useOptimizedContacts } from '@/hooks/useOptimizedContacts';
import { Contact, UpdateContactData } from '@/types/Contact';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { supabase } from '@/integrations/supabase/client';

export default function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [localLoading, setLocalLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const {
    contacts,
    getContactById,
    updateContact,
    isLoading: contactsLoading
  } = useOptimizedContacts();
  
  const isUpdating = false; // Will be true during actual operations

  // Handle legacy URL redirections (from drawer URLs)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/contactos/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Update loading state based on contacts loading
  useEffect(() => {
    setLocalLoading(contactsLoading);
  }, [contactsLoading]);

  // Find the contact once contacts are loaded
  useEffect(() => {
    if (contacts && id) {
      const foundContact = contacts.find(c => c.id === id);
      if (foundContact) {
        setContact(foundContact);
        // Set document title
        document.title = `Contacto • ${foundContact.name}`;
      } else if (!localLoading) {
        // Contact not found, redirect to contacts list
        navigate('/contactos', { replace: true });
      }
    }
  }, [contacts, id, navigate, localLoading]);

  // Scroll to top when contact changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Contactos';
    };
  }, []);

  const handleUpdateContact = async (contactId: string, contactData: UpdateContactData) => {
    try {
      // Always use contact update service - leads are now completely separate
      const result = await updateContact(contactId, contactData);
      if (result) {
        // Update local contact state
        setContact(prev => prev ? { ...prev, ...result } : null);
      }
      
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
  };

  // Navigation between contacts
  const getCurrentContactIndex = () => {
    if (!contacts || !contact) return -1;
    return contacts.findIndex(c => c.id === contact.id);
  };

  const handlePrevious = () => {
    if (!contacts) return;
    const currentIndex = getCurrentContactIndex();
    if (currentIndex > 0) {
      const previousContact = contacts[currentIndex - 1];
      navigate(`/contactos/${previousContact.id}`);
    }
  };

  const handleNext = () => {
    if (!contacts) return;
    const currentIndex = getCurrentContactIndex();
    if (currentIndex < contacts.length - 1) {
      const nextContact = contacts[currentIndex + 1];
      navigate(`/contactos/${nextContact.id}`);
    }
  };

  const currentIndex = getCurrentContactIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = contacts ? currentIndex < contacts.length - 1 : false;

  if (localLoading) {
    return <LoadingSkeleton />;
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Contacto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ContactHeader
          contact={contact}
          onEdit={handleEdit}
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
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Actividad
                </TabsTrigger>
                <TabsTrigger 
                  value="emails"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Emails
                </TabsTrigger>
                <TabsTrigger 
                  value="calls"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Llamadas
                </TabsTrigger>
                <TabsTrigger 
                  value="company"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Empresa
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Notas
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Tareas
                </TabsTrigger>
                <TabsTrigger 
                  value="files"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Archivos
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <PersonOverviewTab contact={contact} />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 p-6">
                  <ContactTimeline contact={contact} />
                </TabsContent>
                
                <TabsContent value="emails" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Integración de email próximamente</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="calls" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Registro de llamadas próximamente</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="company" className="mt-0 p-6">
                  <ContactCompanyTab 
                    contactId={contact.id} 
                    currentUserId={currentUserId} 
                  />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 p-6">
                  <ContactNotesTab 
                    contactId={contact.id} 
                    currentUserId={currentUserId} 
                  />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-0 p-6">
                  <ContactTasksTab 
                    contactId={contact.id} 
                    currentUserId={currentUserId} 
                  />
                </TabsContent>
                
                <TabsContent value="files" className="mt-0 p-6">
                  <ContactFilesTab 
                    contactId={contact.id} 
                    currentUserId={currentUserId} 
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, collapsible on tablet */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <PersonRecordSidebar contact={contact} onEdit={handleEdit} />
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
            <h2 className="text-lg font-semibold">Detalles del Contacto</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <PersonRecordSidebar contact={contact} onEdit={handleEdit} />
        </div>
      )}

      {/* Edit Contact Dialog */}
      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onUpdateContact={handleUpdateContact}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}