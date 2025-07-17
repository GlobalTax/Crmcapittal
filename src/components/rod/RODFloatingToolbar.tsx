import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Target, 
  Zap,
  Download,
  Share2
} from 'lucide-react';

interface RODFloatingToolbarProps {
  selectedCount: number;
  onGenerate: () => void;
  onPreview: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isGenerating: boolean;
  showPreview: boolean;
}

export function RODFloatingToolbar({
  selectedCount,
  onGenerate,
  onPreview,
  onSelectAll,
  onClearSelection,
  isGenerating,
  showPreview
}: RODFloatingToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center gap-4">
          {/* Selection Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 font-medium">
              {selectedCount} seleccionados
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="gap-2 h-9"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar Vista Previa
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="gap-2 h-9"
            >
              <CheckCircle2 className="h-4 w-4" />
              Seleccionar Todo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="gap-2 h-9"
            >
              <Target className="h-4 w-4" />
              Limpiar
            </Button>

            <div className="w-px h-8 bg-border mx-2"></div>

            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="gap-2 h-9 px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generar ROD
                  <Zap className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}