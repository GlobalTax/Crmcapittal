import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Lightbulb, 
  Coffee, 
  TrendingUp,
  DollarSign,
  Tag,
  Zap
} from 'lucide-react';
import { useSmartTimer, useActivityCategories, useProjectRates } from '@/hooks/useTimeTrackingPro';
import { CreateTimeEntryProData, SmartTimerSuggestion } from '@/types/TimeTrackingPro';
import { toast } from 'sonner';

export const SmartTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProjectRateId, setSelectedProjectRateId] = useState<string>('');
  const [isBillable, setIsBillable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [focusScore, setFocusScore] = useState(1.0);
  const [interruptionsCount, setInterruptionsCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const { 
    suggestions, 
    activeSuggestions,
    createTimeEntry, 
    isCreating,
    generateSmartSuggestions 
  } = useSmartTimer();
  
  const { data: categories } = useActivityCategories();
  const { rates } = useProjectRates();

  const [smartSuggestions, setSmartSuggestions] = useState<SmartTimerSuggestion[]>([]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    // Generar sugerencias inteligentes al cargar
    const loadSuggestions = async () => {
      const newSuggestions = await generateSmartSuggestions();
      setSmartSuggestions(newSuggestions);
    };
    
    loadSuggestions();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = new Date();
    setInterruptionsCount(0);
    setFocusScore(1.0);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleInterruption = () => {
    setInterruptionsCount(prev => prev + 1);
    setFocusScore(prev => Math.max(0.1, prev - 0.1));
    toast.info('Interrupción registrada');
  };

  const handleStop = async () => {
    if (seconds === 0) {
      toast.error('No hay tiempo registrado para guardar');
      return;
    }

    if (!description.trim()) {
      toast.error('Añade una descripción antes de guardar el tiempo');
      return;
    }

    try {
      const timeEntryData: CreateTimeEntryProData = {
        activity_type: selectedCategoryId ? categories?.find(c => c.id === selectedCategoryId)?.name || 'general' : 'general',
        description: description.trim(),
        start_time: startTimeRef.current!.toISOString(),
        end_time: new Date().toISOString(),
        is_billable: isBillable,
        category_id: selectedCategoryId || undefined,
        project_rate_id: selectedProjectRateId || undefined,
        focus_score: focusScore,
        interruptions_count: interruptionsCount,
        tags: tags.length > 0 ? tags : undefined,
        metadata: {
          auto_categorized: false,
          timer_version: 'smart_v1'
        }
      };

      // Calcular hourly_rate si hay project_rate seleccionado
      if (selectedProjectRateId) {
        const projectRate = rates?.find(r => r.id === selectedProjectRateId);
        if (projectRate) {
          timeEntryData.hourly_rate = projectRate.hourly_rate;
        }
      } else if (selectedCategoryId) {
        const category = categories?.find(c => c.id === selectedCategoryId);
        if (category?.default_hourly_rate) {
          timeEntryData.hourly_rate = category.default_hourly_rate;
        }
      }

      createTimeEntry(timeEntryData);

      // Reset timer
      setIsRunning(false);
      setIsPaused(false);
      setSeconds(0);
      setDescription('');
      setSelectedCategoryId('');
      setSelectedProjectRateId('');
      setTags([]);
      setInterruptionsCount(0);
      setFocusScore(1.0);
      startTimeRef.current = null;

      // Recalcular sugerencias
      const newSuggestions = await generateSmartSuggestions();
      setSmartSuggestions(newSuggestions);

    } catch (error) {
      console.error('Error al registrar tiempo:', error);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setDescription('');
    setInterruptionsCount(0);
    setFocusScore(1.0);
    startTimeRef.current = null;
  };

  const handleSuggestionAccept = (suggestion: SmartTimerSuggestion) => {
    switch (suggestion.type) {
      case 'continue_work':
        if (suggestion.data) {
          setDescription(suggestion.data.description || '');
          setSelectedCategoryId(suggestion.data.category_id || '');
          setIsBillable(suggestion.data.is_billable);
          if (suggestion.data.tags) setTags(suggestion.data.tags);
        }
        handleStart();
        break;
      case 'break_reminder':
        // Iniciar timer de descanso
        setDescription('Descanso');
        setSelectedCategoryId('');
        setIsBillable(false);
        handleStart();
        break;
      case 'category_suggestion':
        setSelectedCategoryId(suggestion.data?.categoryId || '');
        break;
    }
    
    setSmartSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const selectedCategory = selectedCategoryId ? categories?.find(c => c.id === selectedCategoryId) : undefined;
  const selectedRate = selectedProjectRateId ? rates?.find(r => r.id === selectedProjectRateId) : undefined;

  return (
    <div className="space-y-6">
      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Sugerencias Inteligentes
          </h3>
          {smartSuggestions.map((suggestion, index) => (
            <Alert key={index} className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSuggestionAccept(suggestion)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Aceptar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSmartSuggestions(prev => prev.filter(s => s !== suggestion))}
                  >
                    Descartar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Smart Timer
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Display del Timer */}
          <div className="text-center">
            <div className="text-5xl font-mono font-bold tracking-wider text-primary mb-2">
              {formatTime(seconds)}
            </div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              {seconds > 0 && <span>{Math.round(seconds / 60)} min</span>}
              {focusScore < 1.0 && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Focus: {Math.round(focusScore * 100)}%
                </span>
              )}
              {interruptionsCount > 0 && (
                <span>{interruptionsCount} interrupciones</span>
              )}
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="flex items-center gap-2"
                disabled={isCreating}
                size="lg"
              >
                <Play className="h-4 w-4" />
                Iniciar
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    onClick={handleResume}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Play className="h-4 w-4" />
                    Reanudar
                  </Button>
                )}
                
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isCreating}
                  size="lg"
                >
                  <Square className="h-4 w-4" />
                  {isCreating ? 'Guardando...' : 'Parar y Guardar'}
                </Button>
              </>
            )}
            
            {(isRunning || seconds > 0) && (
              <>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  disabled={isCreating}
                >
                  Reset
                </Button>
                
                {isRunning && (
                  <Button
                    onClick={handleInterruption}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200"
                  >
                    <Coffee className="h-4 w-4" />
                    Interrupción
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Configuración inteligente */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                        {category.is_billable_by_default && (
                          <DollarSign className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-xs text-muted-foreground">
                  {selectedCategory.description}
                  {selectedCategory.default_hourly_rate && (
                    <span className="ml-2 text-green-600">
                      €{selectedCategory.default_hourly_rate}/h
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-rate">Tarifa del Proyecto</Label>
              <Select value={selectedProjectRateId} onValueChange={setSelectedProjectRateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Usar tarifa específica..." />
                </SelectTrigger>
                <SelectContent>
                  {rates?.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id}>
                      {rate.entity_type}: €{rate.hourly_rate}/h ({rate.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRate && (
                <p className="text-xs text-green-600">
                  Facturación: €{selectedRate.hourly_rate}/hora
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del trabajo</Label>
            <Textarea
              id="description"
              placeholder="¿En qué estás trabajando?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Añadir tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                Añadir
              </Button>
            </div>
          </div>

          {/* Configuración avanzada */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="billable">Tiempo facturable</Label>
              <Switch
                id="billable"
                checked={isBillable}
                onCheckedChange={setIsBillable}
              />
            </div>

            {isRunning && (
              <div className="space-y-2">
                <Label>Estado de Focus</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${focusScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(focusScore * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          {isRunning && startTimeRef.current && (
            <div className="text-xs text-muted-foreground text-center border-t pt-4">
              Iniciado: {startTimeRef.current.toLocaleTimeString()}
              {selectedCategory && (
                <span className="ml-4">
                  Categoría: {selectedCategory.name}
                </span>
              )}
              {selectedRate && (
                <span className="ml-4 text-green-600">
                  €{((seconds / 3600) * selectedRate.hourly_rate).toFixed(2)} acumulado
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};