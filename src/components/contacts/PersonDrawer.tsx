import { useState, useEffect } from 'react';
import { X, Star, StarOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Contact } from '@/types/Contact';
import { PersonOverviewTab } from './PersonOverviewTab';
import { PersonActivityTab } from './PersonActivityTab';
import { PersonRecordSidebar } from './PersonRecordSidebar';

interface PersonDrawerProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
}

export const PersonDrawer = ({
  contact,
  open,
  onClose,
  onEdit
}: PersonDrawerProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComposeEmail, setShowComposeEmail] = useState(false);

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

  const handleComposeEmail = () => {
    setShowComposeEmail(true);
    // TODO: Implement email composer
  };

  if (!contact) return null;

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
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{contact.name}</h2>
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleComposeEmail}>
                <Mail className="h-4 w-4 mr-1" />
                Compose email
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
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
                    value="company"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
                  >
                    Company
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
                    <PersonOverviewTab contact={contact} />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0 p-6">
                    <PersonActivityTab contact={contact} />
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
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No company information available</p>
                        </div>
                      )}
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
                  <PersonRecordSidebar contact={contact} onEdit={onEdit} />
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Compose Email Stub Modal */}
      {showComposeEmail && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compose Email</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposeEmail(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Email integration coming soon. This will open your default email client to compose an email to {contact.email}.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                Close
              </Button>
              <Button onClick={() => {
                // Open default email client
                window.location.href = `mailto:${contact.email}`;
                setShowComposeEmail(false);
              }}>
                Open Email Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};