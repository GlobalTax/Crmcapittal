import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, PlayCircle, PauseCircle } from 'lucide-react';
import { useWinbackSequences } from '@/hooks/useWinbackSequences';
import { WinbackSequenceForm } from './WinbackSequenceForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const WinbackSequenceManager = () => {
  const { sequences, isLoading, deleteSequence, toggleSequenceStatus } = useWinbackSequences();
  const [showForm, setShowForm] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);

  const handleEdit = (sequence: any) => {
    setEditingSequence(sequence);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingSequence(null);
    setShowForm(true);
  };

  const getChannelBadgeColor = (canal: string) => {
    switch (canal) {
      case 'email': return 'bg-blue-500';
      case 'call': return 'bg-green-500';
      case 'linkedin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (showForm) {
    return (
      <WinbackSequenceForm
        sequence={editingSequence}
        onClose={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secuencias Winback</h2>
          <p className="text-muted-foreground">
            Gestiona las secuencias de reactivación de leads perdidos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Secuencia
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sequences.map((sequence) => (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{sequence.nombre}</CardTitle>
                    <Badge variant={sequence.activo ? 'default' : 'secondary'}>
                      {sequence.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                    {sequence.lost_reason_trigger && (
                      <Badge variant="outline">
                        Trigger: {sequence.lost_reason_trigger}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSequenceStatus(sequence.id, !sequence.activo)}
                    >
                      {sequence.activo ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(sequence)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar secuencia?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la secuencia y todos sus pasos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSequence(sequence.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {sequence.descripcion && (
                  <p className="text-sm text-muted-foreground">{sequence.descripcion}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Pasos de la secuencia:</h4>
                  <div className="grid gap-2">
                    {sequence.pasos.map((paso: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Día {paso.dias}
                        </span>
                        <Badge 
                          className={`${getChannelBadgeColor(paso.canal)} text-white`}
                        >
                          {paso.canal}
                        </Badge>
                        <span className="text-sm flex-1">
                          {paso.asunto || paso.script || paso.mensaje || 'Sin descripción'}
                        </span>
                        {paso.prioridad && (
                          <Badge variant="outline" className="text-xs">
                            {paso.prioridad}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};