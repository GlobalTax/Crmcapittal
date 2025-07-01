
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  context?: string
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  context = 'aplicación' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
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
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="ghost"
            >
              Recargar página
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Detalles técnicos
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
