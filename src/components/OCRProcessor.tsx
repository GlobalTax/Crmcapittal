
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileImage, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';

interface OCRProcessorProps {
  onTextExtracted: (text: string) => void;
}

export const OCRProcessor = ({ onTextExtracted }: OCRProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede superar los 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setExtractedText('');
  };

  const processOCR = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(selectedImage, 'spa+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      setExtractedText(text);
      onTextExtracted(text);

      toast({
        title: "OCR completado",
        description: "Texto extraído correctamente de la imagen",
      });

    } catch (error) {
      // Error processing OCR
      toast({
        title: "Error OCR",
        description: "No se pudo procesar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <FileImage className="h-4 w-4 sm:h-5 sm:w-5" />
          Procesamiento OCR
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Sube una imagen con texto para extraer los datos automáticamente
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="block w-full text-xs sm:text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {previewUrl && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs sm:text-sm"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Ocultar Vista Previa
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Mostrar Vista Previa
                  </>
                )}
              </Button>

              {showPreview && (
                <div className="border rounded-lg p-2 bg-muted overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-48 sm:max-h-64 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={processOCR}
              disabled={!selectedImage || isProcessing}
              className="flex-1 text-xs sm:text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Procesando... {progress}%</span>
                  <span className="sm:hidden">{progress}%</span>
                </>
              ) : (
                <>
                  <FileImage className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Extraer Texto
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {extractedText && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Texto extraído:</label>
              <Textarea
                value={extractedText}
                onChange={(e) => {
                  setExtractedText(e.target.value);
                  onTextExtracted(e.target.value);
                }}
                className="min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm resize-none"
                placeholder="El texto extraído aparecerá aquí..."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
