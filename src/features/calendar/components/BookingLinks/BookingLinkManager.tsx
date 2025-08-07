import React, { useState } from 'react';
import { Plus, Calendar, Clock, Link, Settings, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBookingLinks, useBookingMutations, useBookingLinkStats } from '../../hooks/useBookingLinks';
import { BookingLinkForm } from './BookingLinkForm';
import { BookingLink } from '../../types';
import { toast } from 'sonner';

export function BookingLinkManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<BookingLink | null>(null);
  
  const { data: bookingLinks, isLoading } = useBookingLinks();
  const { deleteBookingLink } = useBookingMutations();

  const handleCreateLink = () => {
    setEditingLink(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditLink = (link: BookingLink) => {
    setEditingLink(link);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este enlace de reserva?')) {
      try {
        await deleteBookingLink(linkId);
        toast.success('Enlace eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el enlace');
      }
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/booking/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setEditingLink(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enlaces de Reserva</h2>
          <p className="text-muted-foreground">
            Gestiona tus enlaces de booking para que los clientes puedan reservar citas
          </p>
        </div>
        <Button onClick={handleCreateLink}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Enlace
        </Button>
      </div>

      {/* Booking Links Grid */}
      {!bookingLinks || bookingLinks.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes enlaces de reserva</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer enlace para que los clientes puedan reservar citas contigo
            </p>
            <Button onClick={handleCreateLink}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Enlace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookingLinks.map(link => (
            <BookingLinkCard
              key={link.id}
              link={link}
              onEdit={() => handleEditLink(link)}
              onDelete={() => handleDeleteLink(link.id)}
              onCopyLink={() => handleCopyLink(link.slug)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? 'Editar Enlace de Reserva' : 'Crear Enlace de Reserva'}
            </DialogTitle>
          </DialogHeader>
          <BookingLinkForm
            link={editingLink}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BookingLinkCardProps {
  link: BookingLink;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}

function BookingLinkCard({ link, onEdit, onDelete, onCopyLink }: BookingLinkCardProps) {
  const stats = useBookingLinkStats(link.id);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{link.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {link.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCopyLink}>
                <Link className="h-4 w-4 mr-2" />
                Copiar Enlace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Duration and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{link.duration_minutes} minutos</span>
          </div>
          <Badge variant={link.is_active ? "default" : "secondary"}>
            {link.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{stats.total_bookings}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{stats.confirmed_bookings}</div>
              <div className="text-xs text-muted-foreground">Confirmadas</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopyLink} className="flex-1">
            <Link className="h-4 w-4 mr-2" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`/booking/${link.slug}`, '_blank')}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick info */}
        <div className="text-xs text-muted-foreground">
          <div>Slug: {link.slug}</div>
          {link.booking_limit_per_day && (
            <div>Límite: {link.booking_limit_per_day}/día</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}