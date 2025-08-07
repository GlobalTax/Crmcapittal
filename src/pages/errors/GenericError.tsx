import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function GenericError() {
  useEffect(() => {
    document.title = 'Error | CRM Pro'
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="text-center space-y-4 max-w-md">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Ha ocurrido un error</h1>
        </div>
        <p className="text-muted-foreground">Algo no ha ido bien. Puedes reintentar o volver al inicio.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
          <Link to="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
