import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, StickyNote, Clock, User, Lock, Globe } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { logger } from '@/utils/productionLogger';

interface MandateNotesTabProps {
  mandate: BuyingMandate;
}

export const MandateNotesTab: React.FC<MandateNotesTabProps> = ({ mandate }) => {
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Mock data - En producción vendría de la base de datos
  const notes = [
    {
      id: '1',
      content: 'Cliente muy interesado en empresas del sector tecnológico. Prefiere empresas con facturación entre 5-10M€.',
      type: 'client',
      isPrivate: false,
      createdBy: 'Juan Pérez',
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      content: 'CONFIDENCIAL: Cliente tiene liquidez inmediata de 15M€. Puede cerrar operación en 30 días.',
      type: 'internal',
      isPrivate: true,
      createdBy: 'María García',
      createdAt: new Date('2024-01-16T14:20:00'),
      updatedAt: new Date('2024-01-16T14:20:00')
    },
    {
      id: '3',
      content: 'Cliente solicita información detallada sobre competidores en el mercado catalán.',
      type: 'client',
      isPrivate: false,
      createdBy: 'Carlos Martín',
      createdAt: new Date('2024-01-17T09:15:00'),
      updatedAt: new Date('2024-01-17T09:15:00')
    },
    {
      id: '4',
      content: 'Reunión programada para el próximo viernes para revisar targets identificados.',
      type: 'meeting',
      isPrivate: false,
      createdBy: 'Ana López',
      createdAt: new Date('2024-01-18T16:45:00'),
      updatedAt: new Date('2024-01-18T16:45:00')
    }
  ];

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'internal': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'client': return 'Cliente';
      case 'internal': return 'Interno';
      case 'meeting': return 'Reunión';
      default: return 'Nota';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Aquí se agregaría la lógica para guardar la nota
      logger.info('Nueva nota agregada', { note: newNote.substring(0, 50) }, 'MandateNotesTab');
      setNewNote('');
      setShowAddNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notas del Mandato</h3>
          <p className="text-sm text-muted-foreground">
            Registro de notas internas y comunicaciones con el cliente
          </p>
        </div>
        <Button onClick={() => setShowAddNote(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Nota
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notas</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
              <StickyNote className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Públicas</p>
                <p className="text-2xl font-bold">
                  {notes.filter(n => !n.isPrivate).length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Privadas</p>
                <p className="text-2xl font-bold">
                  {notes.filter(n => n.isPrivate).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {notes.filter(n => {
                    const noteDate = new Date(n.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return noteDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario para nueva nota */}
      {showAddNote && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Nota</CardTitle>
            <CardDescription>
              Agrega una nueva nota para este mandato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Escribe tu nota aquí..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Tipo:</label>
                  <select className="text-sm border rounded px-2 py-1">
                    <option value="client">Cliente</option>
                    <option value="internal">Interno</option>
                    <option value="meeting">Reunión</option>
                  </select>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" />
                    <span>Nota privada</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddNote(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddNote}>
                    Guardar Nota
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Notas */}
      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(note.createdBy)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{note.createdBy}</span>
                      <Badge className={getNoteTypeColor(note.type)}>
                        {getNoteTypeLabel(note.type)}
                      </Badge>
                      {note.isPrivate && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Privada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed">{note.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};