import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Lightbulb, Target, Award, TrendingUp } from 'lucide-react';

interface TeaserHighlightsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

const HIGHLIGHT_SUGGESTIONS = [
  'Empresa líder en su sector con fuerte posición de mercado',
  'Crecimiento sostenido de facturación y rentabilidad',
  'Equipo directivo experimentado y comprometido',
  'Cartera de clientes diversificada y recurrente',
  'Tecnología propia y diferenciada',
  'Oportunidades de expansión geográfica',
  'Márgenes superiores a la media del sector',
  'Activos inmobiliarios en propiedad',
  'Contratos a largo plazo con clientes clave',
  'Potencial de mejora operativa y sinergias'
];

export function TeaserHighlights({ data, onChange }: TeaserHighlightsProps) {
  const addHighlight = (text = '') => {
    const currentHighlights = data.key_highlights || [];
    onChange('key_highlights', [...currentHighlights, text]);
  };

  const updateHighlight = (index: number, value: string) => {
    const currentHighlights = data.key_highlights || [];
    const newHighlights = [...currentHighlights];
    newHighlights[index] = value;
    onChange('key_highlights', newHighlights);
  };

  const removeHighlight = (index: number) => {
    const currentHighlights = data.key_highlights || [];
    const newHighlights = currentHighlights.filter((_: any, i: number) => i !== index);
    onChange('key_highlights', newHighlights);
  };

  const addSuggestion = (suggestion: string) => {
    addHighlight(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Puntos Clave de la Oportunidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Destaca los aspectos más atractivos de la empresa para captar el interés de potenciales compradores.
            Enfócate en fortalezas competitivas, oportunidades de crecimiento y factores diferenciadores.
          </p>
        </CardContent>
      </Card>

      {/* Current Highlights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Destacados Actuales
            </CardTitle>
            <Button variant="outline" onClick={() => addHighlight()}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Punto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data.key_highlights || []).map((highlight: string, index: number) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`highlight-${index}`} className="text-xs text-muted-foreground">
                    Punto {index + 1}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`highlight-${index}`}
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder={`Punto clave ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHighlight(index)}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {(!data.key_highlights || data.key_highlights.length === 0) && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay puntos clave definidos</h3>
                <p className="text-muted-foreground mb-4">
                  Añade los aspectos más destacados de la oportunidad
                </p>
                <Button onClick={() => addHighlight()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Punto
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Sugerencias de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Haz clic en cualquier sugerencia para añadirla a tus puntos clave:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {HIGHLIGHT_SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-left h-auto p-3 whitespace-normal"
                onClick={() => addSuggestion(suggestion)}
              >
                <Plus className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Story */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historia de Crecimiento (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="growth_story">Narrativa de Crecimiento</Label>
            <Textarea
              id="growth_story"
              value={data.growth_story || ''}
              onChange={(e) => onChange('growth_story', e.target.value)}
              placeholder="Describe la evolución de la empresa, hitos importantes y perspectivas de futuro..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Una narrativa convincente puede aumentar significativamente el interés de los inversores
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {data.key_highlights && data.key_highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vista Previa de Puntos Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.key_highlights
                .filter((h: string) => h.trim() !== '')
                .map((highlight: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}