import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Action {
  id: string;
  type: string;
  description: string;
  data: any;
  timestamp: Date;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

const MAX_HISTORY_SIZE = 50;

export const useUndoRedo = () => {
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { toast } = useToast();
  const isPerformingAction = useRef(false);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const addAction = useCallback((action: Action) => {
    if (isPerformingAction.current) return;

    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), action];
      return newHistory.slice(-MAX_HISTORY_SIZE);
    });
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
  }, [currentIndex]);

  const undo = useCallback(async () => {
    if (!canUndo || isPerformingAction.current) return;

    const action = history[currentIndex];
    isPerformingAction.current = true;

    try {
      await action.undo();
      setCurrentIndex(prev => prev - 1);
      toast({
        title: "Acción deshecha",
        description: `${action.description} ha sido deshecha`,
      });
    } catch (error) {
      toast({
        title: "Error al deshacer",
        description: "No se pudo deshacer la acción",
        variant: "destructive",
      });
    } finally {
      isPerformingAction.current = false;
    }
  }, [canUndo, currentIndex, history, toast]);

  const redo = useCallback(async () => {
    if (!canRedo || isPerformingAction.current) return;

    const action = history[currentIndex + 1];
    isPerformingAction.current = true;

    try {
      await action.redo();
      setCurrentIndex(prev => prev + 1);
      toast({
        title: "Acción rehecha",
        description: `${action.description} ha sido rehecha`,
      });
    } catch (error) {
      toast({
        title: "Error al rehacer",
        description: "No se pudo rehacer la acción",
        variant: "destructive",
      });
    } finally {
      isPerformingAction.current = false;
    }
  }, [canRedo, currentIndex, history, toast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    addAction,
    undo,
    redo,
    clearHistory
  };
};