import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ContactHeader } from '@/components/contacts/ContactHeader';
import { PersonOverviewTab } from '@/components/contacts/PersonOverviewTab';
import { PersonActivityTab } from '@/components/contacts/PersonActivityTab';
import { PersonRecordSidebar } from '@/components/contacts/PersonRecordSidebar';
import { EditContactDialog } from '@/components/contacts/EditContactDialog';
import { useContactsCRUD } from '@/hooks/useContactsCRUD';
import { Contact, UpdateContactData } from '@/types/Contact';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function ContactPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    fetchedContacts: contacts,
    fetchContacts,
    updateContact,
    isUpdating
  } = useContactsCRUD();

  // Handle legacy URL redirections (from drawer URLs)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/contacts/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Fetch contacts and find the specific contact
  useEffect(() => {
    const loadContact = async () => {
      setIsLoading(true);
      try {
        await fetchContacts();
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContact();
  }, [fetchContacts]);

  // Find the contact once contacts are loaded
  useEffect(() => {
    if (contacts && id) {
      const foundContact = contacts.find(c => c.id === id);
      if (foundContact) {
        setContact(foundContact);
        // Set document title
        document.title = `Contacto • ${foundContact.name}`;
      } else if (!isLoading) {
        // Contact not found, redirect to contacts list
        navigate('/contacts', { replace: true });
      }
    }
  }, [contacts, id, navigate, isLoading]);

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

  const handleUpdateContact = (contactId: string, contactData: UpdateContactData) => {
    updateContact(contactId, contactData).then((result) => {
      if (result) {
        // Update local contact state
        setContact(prev => prev ? { ...prev, ...result } : null);
        setEditingContact(null);
        // Refresh contacts list
        fetchContacts();
      }
    });
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
      navigate(`/contacts/${previousContact.id}`);
    }
  };

  const handleNext = () => {
    if (!contacts) return;
    const currentIndex = getCurrentContactIndex();
    if (currentIndex < contacts.length - 1) {
      const nextContact = contacts[currentIndex + 1];
      navigate(`/contacts/${nextContact.id}`);
    }
  };

  const currentIndex = getCurrentContactIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = contacts ? currentIndex < contacts.length - 1 : false;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Contact not found</p>
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
                  value="calls"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Calls
                </TabsTrigger>
                <TabsTrigger 
                  value="company"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Company
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="files"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Files
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
                  <PersonActivityTab contact={contact} />
                </TabsContent>
                
                <TabsContent value="emails" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Email integration coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="calls" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Call logging coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="company" className="mt-0 p-6">
                  <div className="space-y-4">
                    {contact.company ? (
                      <div>
                        <h3 className="text-sm font-medium mb-3">Company Information</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">{contact.company}</span>
                          </div>
                          {contact.position && (
                            <div className="text-sm text-muted-foreground">
                              {contact.position}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No company information available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Notes coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Task management coming soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="files" className="mt-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">File management coming soon</p>
                  </div>
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
          {activeTab === 'details' ? 'Close Details' : 'Show Details'}
        </Button>
      </div>

      {/* Mobile Details Panel */}
      {activeTab === 'details' && (
        <div className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Contact Details</h2>
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