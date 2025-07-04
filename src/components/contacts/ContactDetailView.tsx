import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Phone, 
  Building, 
  Edit, 
  Trash2, 
  User, 
  Linkedin,
  MapPin,
  Globe,
  ArrowLeft,
  Plus,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Contact } from '@/types/Contact';
import { useContactsCRUD } from '@/hooks/useContactsCRUD';
import { useToast } from '@/hooks/use-toast';
import { ContactTasksTab } from '@/components/contacts/ContactTasksTab';
import { supabase } from '@/integrations/supabase/client';

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export const ContactDetailView = ({ contact, onBack, onEdit, onDelete }: ContactDetailViewProps) => {
  const [activeTab, setActiveTab] = useState('info');
  const [newNote, setNewNote] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { updateContact } = useContactsCRUD();
  const { toast } = useToast();

  // Obtener el usuario actual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      marketing: { label: "Marketing", variant: "secondary" as const },
      sales: { label: "Ventas", variant: "default" as const },
      franquicia: { label: "Franquicia", variant: "outline" as const },
      cliente: { label: "Cliente", variant: "destructive" as const },
      prospect: { label: "Prospect", variant: "secondary" as const },
      other: { label: "Otro", variant: "outline" as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      low: { label: "Baja", variant: "outline" as const },
      medium: { label: "Media", variant: "secondary" as const },
      high: { label: "Alta", variant: "destructive" as const }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const updatedNotes = contact.notes ? `${contact.notes}\n\n${new Date().toLocaleDateString('es-ES')} - ${newNote}` : newNote;
      await updateContact(contact.id, { notes: updatedNotes });
      setNewNote('');
      toast({
        title: "Nota añadida",
        description: "La nota ha sido guardada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la nota.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-card">
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {contact.name?.[0] || <User className="h-8 w-8" />}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{contact.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-sm mt-1 flex-wrap">
                {contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge(contact.contact_type)}
                {getPriorityBadge(contact.contact_priority)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(contact)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => onDelete(contact.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-w-0">
          <TabsList className="flex px-6 pt-4 pb-2 border-b bg-background">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 flex min-h-0">
            {/* Tab content */}
            <div className="flex-1 min-w-0 p-6 overflow-y-auto">
              <TabsContent value="info" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información de Contacto */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      {contact.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            LinkedIn
                          </a>
                        </div>
                      )}
                      {contact.website_url && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={contact.website_url} target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline">
                            {contact.website_url}
                          </a>
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm">{contact.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Información Profesional */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información Profesional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {contact.company && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Empresa</span>
                          <p className="text-sm">{contact.company}</p>
                        </div>
                      )}
                      {contact.position && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Cargo</span>
                          <p className="text-sm">{contact.position}</p>
                        </div>
                      )}
                      {contact.contact_source && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Origen</span>
                          <p className="text-sm"><Badge variant="outline">{contact.contact_source}</Badge></p>
                        </div>
                      )}
                      {contact.preferred_contact_method && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Método preferido</span>
                          <p className="text-sm">{contact.preferred_contact_method}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sectores de Interés */}
                {contact.sectors_of_interest && contact.sectors_of_interest.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-base">Sectores de Interés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contact.sectors_of_interest.map((sector, index) => (
                          <Badge key={index} variant="outline">{sector}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <ContactTasksTab 
                  contactId={contact.id} 
                  currentUserId={currentUserId} 
                />
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Notas</h3>
                  </div>
                  
                  {/* Agregar nueva nota */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Agregar Nota</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Escribe una nueva nota..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Nota
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Notas existentes */}
                  {contact.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Notas Existentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-0">
                <h3 className="text-lg font-semibold mb-4">Archivos</h3>
                <div className="text-muted-foreground">
                  Los archivos relacionados con este contacto aparecerán aquí.
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <h3 className="text-lg font-semibold mb-4">Historial de Emails</h3>
                <div className="text-muted-foreground">
                  El historial de emails con este contacto aparecerá aquí.
                </div>
              </TabsContent>
            </div>

            {/* Activity Timeline Sidebar */}
            <aside className="w-80 border-l bg-muted/30 p-6 overflow-y-auto">
              <h4 className="font-semibold mb-4">Actividad Reciente</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                  <div>
                    <div className="font-medium text-sm">Contacto creado</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(contact.created_at)}
                    </div>
                  </div>
                </div>
                
                {contact.updated_at !== contact.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-secondary"></div>
                    <div>
                      <div className="font-medium text-sm">Contacto actualizado</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(contact.updated_at)}
                      </div>
                    </div>
                  </div>
                )}

                {contact.last_interaction_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-medium text-sm">Última interacción</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(contact.last_interaction_date)}
                      </div>
                    </div>
                  </div>
                )}

                {contact.next_follow_up_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
                    <div>
                      <div className="font-medium text-sm">Próximo seguimiento</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(contact.next_follow_up_date)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactDetailView;