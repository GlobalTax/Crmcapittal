
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { useCases } from '@/hooks/useCases'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { toast } from 'sonner'

export const Timer = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const { cases } = useCases()
  const { createTimeEntry, isCreating } = useTimeEntries()

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    startTimeRef.current = new Date()
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleStop = async () => {
    if (seconds === 0) {
      toast.error('No hay tiempo registrado para guardar')
      return
    }

    if (!description.trim()) {
      toast.error('Añade una descripción antes de guardar el tiempo')
      return
    }

    try {
      const minutes = Math.round(seconds / 60)
      
      await createTimeEntry({
        case_id: selectedCaseId || null,
        description: description.trim(),
        duration_minutes: minutes,
        is_billable: isBillable
      })

      // Reset timer
      setIsRunning(false)
      setIsPaused(false)
      setSeconds(0)
      setDescription('')
      startTimeRef.current = null

      toast.success(`Tiempo registrado: ${minutes} minutos`)
    } catch (error) {
      console.error('Error al registrar tiempo:', error)
      toast.error('Error al registrar el tiempo')
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
    startTimeRef.current = null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timer de Trabajo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Display del Timer */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold tracking-wider text-primary mb-2">
            {formatTime(seconds)}
          </div>
          <div className="text-sm text-muted-foreground">
            {seconds > 0 && `${Math.round(seconds / 60)} minutos`}
          </div>
        </div>

        {/* Controles del Timer */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex items-center gap-2"
              disabled={isCreating}
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
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
              ) : (
                <Button
                  onClick={handleResume}
                  className="flex items-center gap-2"
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
              >
                <Square className="h-4 w-4" />
                Parar y Guardar
              </Button>
            </>
          )}
          
          {(isRunning || seconds > 0) && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={isCreating}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Configuración */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case-select">Caso (Opcional)</Label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger id="case-select">
                <SelectValue placeholder="Seleccionar caso..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin caso específico</SelectItem>
                {cases.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.title} {case_.contact && `(${case_.contact.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del trabajo</Label>
            <Textarea
              id="description"
              placeholder="¿En qué has trabajado?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="billable">Tiempo facturable</Label>
            <Switch
              id="billable"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
          </div>
        </div>

        {/* Información adicional */}
        {isRunning && startTimeRef.current && (
          <div className="text-xs text-muted-foreground text-center">
            Iniciado a las {startTimeRef.current.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
