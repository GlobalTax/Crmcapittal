
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const DigitalClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-blue-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-blue-700 capitalize">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
