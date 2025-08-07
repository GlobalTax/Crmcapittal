import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PermissionDenied() {
  useEffect(() => {
    document.title = 'Acceso denegado | CRM Pro'
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="text-center space-y-4 max-w-md">
        <div className="flex items-center justify-center gap-2 text-destructive">
          <ShieldAlert className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Acceso denegado</h1>
        </div>
        <p className="text-muted-foreground">No tienes permisos para ver este contenido. Contacta con un administrador si crees que es un error.</p>
        <Link to="/">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Ir al inicio
          </Button>
        </Link>
      </section>
    </main>
  )
}
