import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { Contact } from '@/types/Contact'

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    contact_type: 'cliente',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    contact_type: 'prospect',
    created_at: '2023-01-02',
    updated_at: '2023-01-02'
  }
]

describe('ContactsTable', () => {
  it('renders contacts correctly', () => {
    render(
      <ContactsTable 
        contacts={mockContacts}
        onCreateContact={() => {}}
      />
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('shows empty state when no contacts', () => {
    render(
      <ContactsTable 
        contacts={[]}
        onCreateContact={() => {}}
      />
    )
    
    expect(screen.getByText('No se encontraron contactos')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <ContactsTable 
        contacts={[]}
        onCreateContact={() => {}}
        isLoading={true}
      />
    )
    
    expect(screen.getByText('Cargando contactos...')).toBeInTheDocument()
  })
})
