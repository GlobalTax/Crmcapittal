import React from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

interface SectionErrorBoundaryProps {
  section: 'Leads' | 'Deals' | 'Companies' | 'Contacts' | 'Mandatos' | string
  children: React.ReactNode
}

const suggestionsBySection: Record<string, string[]> = {
  Leads: [
    'Refresca filtros o limpia la búsqueda',
    'Reintenta cargar los leads',
    'Comprueba tu conexión de red',
  ],
  Deals: [
    'Reintenta la operación',
    'Verifica permisos de acceso a operaciones',
  ],
  Companies: [
    'Ajusta filtros de sector o país',
    'Reintenta cargar compañías',
  ],
  Contacts: [
    'Comprueba el formato del email/teléfono',
    'Reintenta la búsqueda de contactos',
  ],
  Mandatos: [
    'Reintenta cargar los mandatos',
    'Verifica el tipo de Mandato (Buy/Sell)',
  ],
}

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({ section, children }) => {
  const suggestions = suggestionsBySection[section] || ['Intenta de nuevo la acción realizada']
  
  const Fallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
    const { ErrorFallback } = require('@/components/common/ErrorFallback')
    return <ErrorFallback error={error} resetError={resetError} context={section} suggestions={suggestions} />
  }

  return (
    <ErrorBoundary fallback={Fallback} context={section}>
      {children}
    </ErrorBoundary>
  )
}
