import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Lead } from '@/types/Lead';
import { LeadClosureActionDialog } from '../LeadClosureActionDialog';

// Mock dependencies
vi.mock('@/services/analyticsService', () => ({
  analyticsService: {
    track: vi.fn()
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockLead: Lead = {
  id: 'lead-123',
  name: 'Test Lead',
  email: 'test@example.com',
  phone: '+34 123 456 789',
  company: 'Test Company',
  message: 'Queremos vender nuestra empresa',
  service_type: 'mandato_venta',
  source: 'website_form',
  status: 'NEW',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockOnCreateFromLead = vi.fn().mockResolvedValue({ success: true, id: 'new-id' });

describe('LeadClosureActionDialog - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with lead information', () => {
    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    expect(screen.getByText('Crear desde Lead: Test Lead')).toBeInTheDocument();
  });

  test('should show recommended option', () => {
    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    expect(screen.getByText('Recomendado')).toBeInTheDocument();
  });

  test('should validate required fields', () => {
    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Select mandato de venta
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    
    // Submit button should be disabled when required fields are empty
    const submitButton = screen.getByText('Crear Mandato de Venta');
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit when form is valid', () => {
    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Select and fill form
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@test.com' } });
    
    const submitButton = screen.getByText('Crear Mandato de Venta');
    expect(submitButton).not.toBeDisabled();
  });

  test('should call onCreateFromLead with correct data', async () => {
    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Fill and submit form
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@test.com' } });
    
    fireEvent.click(screen.getByText('Crear Mandato de Venta'));

    await waitFor(() => {
      expect(mockOnCreateFromLead).toHaveBeenCalledWith(
        'lead-123',
        'mandato_venta',
        expect.objectContaining({
          company_name: 'Test Corp',
          contact_name: 'John Doe',
          contact_email: 'john@test.com'
        }),
        true
      );
    });
  });
});