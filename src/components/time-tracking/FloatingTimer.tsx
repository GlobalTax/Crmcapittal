
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FloatingTimerProps {
  onSave: (seconds: number) => void
  className?: string
}

export const FloatingTimer = ({ onSave, className }: FloatingTimerProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)

  // Cargar estado del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('floating-timer-state')
    if (saved) {
      const state = JSON.parse(saved)
      setSeconds(state.seconds || 0)
      setIsRunning(state.isRunning || false)
      setIsPaused(state.isPaused || false)
      setPosition(state.position || { x: 20, y: 20 })
    }

    // Atajos de teclado
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault()
        handlePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Guardar estado en localStorage
  useEffect(() => {
    const state = {
      seconds,
      isRunning,
      isPaused,
      position
    }
    localStorage.setItem('floating-timer-state', JSON.stringify(state))
  }, [seconds, isRunning, isPaused, position])

  // Timer logic
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

  const handlePlayPause = () => {
    if (!isRunning) {
      setIsRunning(true)
      setIsPaused(false)
    } else if (!isPaused) {
      setIsPaused(true)
    } else {
      setIsPaused(false)
    }
  }

  const handleStop = () => {
    if (seconds > 0) {
      onSave(seconds)
    }
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return

    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY

    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.startPosX + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + deltaY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    dragRef.current = null
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <Card
      className={cn(
        "fixed z-50 shadow-lg border-2 transition-all duration-200",
        isRunning ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isExpanded ? '280px' : '160px'
      }}
    >
      <div
        className="p-3 select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-lg font-bold">
            {formatTime(seconds)}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlayPause}
            className="h-7 px-2 flex-1"
          >
            {!isRunning || isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          
          {isRunning && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStop}
              className="h-7 px-2"
              disabled={seconds === 0}
            >
              <Square className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-2 text-xs text-gray-500">
            <div>Ctrl + Espacio: Pausar/Reanudar</div>
            <div>Estado: {isRunning ? (isPaused ? 'Pausado' : 'Activo') : 'Detenido'}</div>
          </div>
        )}
      </div>
    </Card>
  )
}
