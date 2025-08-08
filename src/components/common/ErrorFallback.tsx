
import * as React from 'react';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  context?: string
  suggestions?: string[]
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  context = 'aplicación',
  suggestions = []
}) => {
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Error en {context}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700 font-medium">
              {error.message || 'Ha ocurrido un error inesperado'}
            </p>
          </div>

          {suggestions.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Bug className="h-4 w-4" />
                Sugerencias de recuperación
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={resetError} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
            
            <Button 
              onClick={handleReload} 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar página
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
          
          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Detalles técnicos
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
