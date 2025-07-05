import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  History, 
  Undo2, 
  Redo2, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActionHistory: React.FC = () => {
  const { history, currentIndex, canUndo, canRedo, undo, redo } = useUndoRedo();

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'delete': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (index: number) => {
    if (index > currentIndex) return 'text-muted-foreground';
    if (index === currentIndex) return 'text-primary';
    return 'text-foreground';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Undo/Redo Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center gap-2"
        title="Deshacer (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
        Deshacer
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center gap-2"
        title="Rehacer (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
        Rehacer
      </Button>

      {/* History Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {history.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle>Historial de Acciones</SheetTitle>
            <SheetDescription>
              Últimas {history.length} acciones realizadas
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <History className="h-8 w-8 mb-2" />
                <span className="text-sm">No hay acciones en el historial</span>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((action, index) => (
                  <div
                    key={action.id}
                    className={`p-3 rounded-lg border transition-all ${
                      index > currentIndex 
                        ? 'bg-muted/50 border-muted' 
                        : index === currentIndex
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getActionIcon(action.type)}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${getActionColor(index)}`}>
                          {action.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(action.timestamp, { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {index > currentIndex && (
                          <Badge variant="outline" className="text-xs">
                            Deshecha
                          </Badge>
                        )}
                        {index === currentIndex && (
                          <Badge variant="default" className="text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                className="flex-1"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Deshacer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                className="flex-1"
              >
                <Redo2 className="h-4 w-4 mr-2" />
                Rehacer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};