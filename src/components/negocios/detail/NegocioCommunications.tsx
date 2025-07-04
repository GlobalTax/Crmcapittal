import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Mail, Phone, Calendar, Users } from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NegocioCommunicationsProps {
  negocio: Negocio;
}

interface Communication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'message';
  subject: string;
  content: string;
  participants: string[];
  contact_person: string;
  date: string;
  status: 'sent' | 'received' | 'scheduled' | 'completed';
  follow_up_required: boolean;
  follow_up_date?: string;
  attachments?: string[];
}

const communicationTypes = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'call', label: 'Llamada', icon: Phone },
  { value: 'meeting', label: 'Reunión', icon: Calendar },
  { value: 'message', label: 'Mensaje', icon: MessageSquare }
];

const communicationStatuses = [
  { value: 'sent', label: 'Enviado' },
  { value: 'received', label: 'Recibido' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'completed', label: 'Completado' }
];

// Mock data - in real implementation, this would come from a database
const mockCommunications: Communication[] = [
  {
    id: '1',
    type: 'email',
    subject: 'Envío de NDA para revisión',
    content: 'Estimado Sr. Martínez, adjunto el acuerdo de confidencialidad para su revisión y firma.',
    participants: ['roberto@grupoinversor.com'],
    contact_person: 'Roberto Martínez',
    date: '2024-01-15T10:30:00',
    status: 'sent',
    follow_up_required: true,
    follow_up_date: '2024-01-17',
    attachments: ['NDA_Grupo_Inversor.pdf']
  },
  {
    id: '2',
    type: 'call',
    subject: 'Llamada inicial de presentación',
    content: 'Conversación telefónica para presentar la oportunidad de inversión. Duración: 45 minutos.',
    participants: ['Ana Fernández'],
    contact_person: 'Ana Fernández',
    date: '2024-01-12T14:00:00',
    status: 'completed',
    follow_up_required: false,
    attachments: []
  },
  {
    id: '3',
    type: 'meeting',
    subject: 'Reunión de due diligence',
    content: 'Reunión presencial para revisar documentación financiera y operativa.',
    participants: ['Roberto Martínez', 'Ana Fernández', 'Equipo Legal'],
    contact_person: 'Roberto Martínez',
    date: '2024-01-20T16:00:00',
    status: 'scheduled',
    follow_up_required: true,
    follow_up_date: '2024-01-21'
  }
];

export const NegocioCommunications = ({ negocio }: NegocioCommunicationsProps) => {
  const [communications, setCommunications] = useState<Communication[]>(mockCommunications);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [commForm, setCommForm] = useState({
    type: 'email',
    subject: '',
    content: '',
    contact_person: '',
    participants: '',
    date: '',
    status: 'sent',
    follow_up_required: false,
    follow_up_date: ''
  });

  const getTypeIcon = (type: string) => {
    const commType = communicationTypes.find(t => t.value === type);
    return commType ? commType.icon : MessageSquare;
  };

  const getTypeLabel = (type: string) => {
    const commType = communicationTypes.find(t => t.value === type);
    return commType ? commType.label : type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusObj = communicationStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateCommunication = () => {
    if (commForm.subject && commForm.contact_person) {
      const newCommunication: Communication = {
        id: Date.now().toString(),
        type: commForm.type as Communication['type'],
        subject: commForm.subject,
        content: commForm.content,
        participants: commForm.participants.split(',').map(p => p.trim()),
        contact_person: commForm.contact_person,
        date: commForm.date || new Date().toISOString(),
        status: commForm.status as Communication['status'],
        follow_up_required: commForm.follow_up_required,
        follow_up_date: commForm.follow_up_date || undefined,
        attachments: []
      };
      
      setCommunications([newCommunication, ...communications]);
      setCommForm({
        type: 'email',
        subject: '',
        content: '',
        contact_person: '',
        participants: '',
        date: '',
        status: 'sent',
        follow_up_required: false,
        follow_up_date: ''
      });
      setShowCreateDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Historial de Comunicaciones
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comunicación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Comunicación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comm-type">Tipo</Label>
                    <Select value={commForm.type} onValueChange={(value) => setCommForm({ ...commForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {communicationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="comm-status">Estado</Label>
                    <Select value={commForm.status} onValueChange={(value) => setCommForm({ ...commForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {communicationStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="comm-subject">Asunto</Label>
                  <Input
                    id="comm-subject"
                    value={commForm.subject}
                    onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="comm-content">Contenido</Label>
                  <Textarea
                    id="comm-content"
                    value={commForm.content}
                    onChange={(e) => setCommForm({ ...commForm, content: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comm-contact">Persona de Contacto</Label>
                    <Input
                      id="comm-contact"
                      value={commForm.contact_person}
                      onChange={(e) => setCommForm({ ...commForm, contact_person: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comm-participants">Participantes</Label>
                    <Input
                      id="comm-participants"
                      value={commForm.participants}
                      onChange={(e) => setCommForm({ ...commForm, participants: e.target.value })}
                      placeholder="Separados por comas"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comm-date">Fecha y Hora</Label>
                    <Input
                      id="comm-date"
                      type="datetime-local"
                      value={commForm.date}
                      onChange={(e) => setCommForm({ ...commForm, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comm-follow-up-date">Fecha de Seguimiento</Label>
                    <Input
                      id="comm-follow-up-date"
                      type="date"
                      value={commForm.follow_up_date}
                      onChange={(e) => setCommForm({ ...commForm, follow_up_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCommunication} disabled={!commForm.subject || !commForm.contact_person}>
                    Registrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map((comm) => {
              const IconComponent = getTypeIcon(comm.type);
              return (
                <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{comm.subject}</h4>
                          <Badge className={getStatusColor(comm.status)}>
                            {getStatusLabel(comm.status)}
                          </Badge>
                          {comm.follow_up_required && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                              Seguimiento Requerido
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {comm.contact_person}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(comm.date)}
                          </div>
                          {comm.follow_up_date && (
                            <div className="flex items-center text-orange-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Seguimiento: {comm.follow_up_date}
                            </div>
                          )}
                        </div>
                        {comm.attachments && comm.attachments.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">Adjuntos:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {comm.attachments.map((attachment, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay comunicaciones registradas</h3>
            <p className="text-sm mb-4">Las comunicaciones con compradores aparecerán aquí</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};