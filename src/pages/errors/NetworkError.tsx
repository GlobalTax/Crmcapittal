import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NetworkError() {
  useEffect(() => {
    document.title = 'Error de red | CRM Pro'
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="text-center space-y-4 max-w-md">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <WifiOff className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Problema de conexión</h1>
        </div>
        <p className="text-muted-foreground">No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
          <Link to="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
