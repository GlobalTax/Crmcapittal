import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Send,
  Star,
  Copy,
  ExternalLink,
  Clock,
  Tag,
  UserCheck,
  Activity
} from 'lucide-react';
import { Contact } from '@/types/Contact';
import { useContactsCRUD } from '@/hooks/useContactsCRUD';
import { useToast } from '@/hooks/use-toast';
import { ContactTasksTab } from '@/components/contacts/ContactTasksTab';
import ContactFilesTab from '@/components/contacts/ContactFilesTab';
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      toast({
        title: "Email copiado",
        description: "El email ha sido copiado al portapapeles",
      });
    }
  };

  const handleCopyPhone = () => {
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone);
      toast({
        title: "Teléfono copiado",
        description: "El teléfono ha sido copiado al portapapeles",
      });
    }
  };

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `${contact.name} ${isFavorite ? "eliminado de" : "agregado a"} favoritos`,
    });
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
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Contactos
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground truncate">{contact.email}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Enviar una campaña
            </Button>
          </div>
        </div>

        {/* Contact Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {contact.name?.[0] || <User className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{contact.name}</h1>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleToggleFavorite}
                    className={`p-1 h-auto ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 mb-1">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary hover:underline text-sm"
                      onClick={() => window.open(`mailto:${contact.email}`)}
                    >
                      {contact.email}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopyEmail} className="p-1 h-auto">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {contact.phone && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary hover:underline text-sm"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      >
                        {contact.phone}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCopyPhone} className="p-1 h-auto">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>{contact.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            {getTypeBadge(contact.contact_type)}
            {getPriorityBadge(contact.contact_priority)}
            {contact.contact_source && (
              <Badge variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {contact.contact_source}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-w-0">
          <TabsList className="flex px-6 pt-4 pb-2 bg-background border-b">
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Información personal
            </TabsTrigger>
            <TabsTrigger value="deals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Todos los tratos (0)
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 flex min-h-0">
            {/* Tab content */}
            <div className="flex-1 min-w-0 p-6 overflow-y-auto space-y-6">
              <TabsContent value="info" className="mt-0 space-y-6">
                {/* Detalles Generales - Collapsible */}
                <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                  <div className="border-b border-border/50">
                    <CollapsibleTrigger asChild>
                      <div className="hover:bg-muted/50 cursor-pointer transition-colors p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Detalles generales
                          </h3>
                          {isDetailsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Nombre</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{contact.name || 'Haga clic para añadir'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Apellidos</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Haga clic para añadir</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Correo electrónico *</label>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-primary hover:underline text-sm"
                                onClick={() => window.open(`mailto:${contact.email}`)}
                              >
                                {contact.email}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Teléfono</label>
                            <div className="flex items-center gap-2">
                              {contact.phone ? (
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto text-primary hover:underline text-sm"
                                  onClick={() => window.open(`tel:${contact.phone}`)}
                                >
                                  {contact.phone}
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">Haga clic para añadir</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Cuenta</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{contact.company || 'Haga clic para añadir'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Preferred Language</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Haga clic para añadir</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Links */}
                        <div className="flex gap-2 pt-4 border-t">
                          {contact.linkedin_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(contact.linkedin_url, '_blank')}
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {contact.website_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(contact.website_url, '_blank')}
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Etiquetas */}
                <div className="border-b border-border/50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Etiquetas
                      </h3>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                        Introducir etiqueta
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contact.sectors_of_interest?.map((sector, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {sector}
                        </Badge>
                      ))}
                      {getTypeBadge(contact.contact_type)}
                      {getPriorityBadge(contact.contact_priority)}
                    </div>
                  </div>
                </div>

                {/* Listas */}
                <div className="border-b border-border/50">
                  <div className="p-4">
                    <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4" />
                      Listas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">Correo electrónico</span>
                          <Badge variant="outline" className="text-xs">Estado</Badge>
                          <Badge variant="outline" className="text-xs">Fuente</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Master Contact List</span>
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-muted-foreground mb-2">SMS</div>
                        <p className="text-sm text-blue-600">Este contacto no se añadió a tus listas de SMS todavía.</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tareas Abiertas - Collapsible */}
                <Collapsible open={isTasksOpen} onOpenChange={setIsTasksOpen}>
                  <div className="border-b border-border/50">
                    <CollapsibleTrigger asChild>
                      <div className="hover:bg-muted/50 cursor-pointer transition-colors p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Tareas abiertas (0)
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button variant="link" size="sm" className="text-primary">
                              Ver tareas completadas
                            </Button>
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4" />
                              Añadir una tarea
                            </Button>
                            {isTasksOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">No hay tareas abiertas</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Notas - Collapsible */}
                <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                  <div className="border-b border-border/50">
                    <CollapsibleTrigger asChild>
                      <div className="hover:bg-muted/50 cursor-pointer transition-colors p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Notas (0)
                            </h3>
                            <Badge variant="secondary" className="text-xs">Archivos (0)</Badge>
                            <Badge variant="secondary" className="text-xs">Emails (0)</Badge>
                            <Badge variant="secondary" className="text-xs">SMS (0)</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4" />
                              Añadir una nota
                            </Button>
                            {isNotesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        {contact.notes ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                              <MessageSquare className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No hay notas</p>
                          </div>
                        )}
                        
                        {/* Add note section */}
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <Textarea
                            placeholder="Escribe una nueva nota..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Nota
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>

              <TabsContent value="deals" className="mt-0">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay tratos todavía</h3>
                  <p className="text-muted-foreground mb-4">Los tratos asociados con este contacto aparecerán aquí.</p>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Trato
                  </Button>
                </div>
              </TabsContent>
            </div>

            {/* Activity Timeline Sidebar */}
            <aside className="w-80 border-l bg-muted/10 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Actividades recientes</h4>
                <Button variant="ghost" size="sm" className="text-primary">
                  Todas las actividades
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Subscription Activity */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Se suscribió a la lista</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Se suscribió a la lista correo electrónico Master Contact List a través de la API
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      hace 2 días
                    </div>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary mt-1">
                      Comentario
                    </Button>
                  </div>
                </div>

                {/* Contact Created */}
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Contacto creado</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(contact.created_at)}
                    </div>
                  </div>
                </div>

                {contact.updated_at !== contact.created_at && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Edit className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Contacto actualizado</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(contact.updated_at)}
                      </div>
                    </div>
                  </div>
                )}

                {contact.last_interaction_date && (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Última interacción</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(contact.last_interaction_date)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t">
                <h5 className="font-medium text-sm mb-3">Acciones rápidas</h5>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Programar cita
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear tarea
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ContactDetailView;