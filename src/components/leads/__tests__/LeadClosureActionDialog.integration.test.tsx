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

const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'lead-123',
  name: 'Integration Test Lead',
  email: 'integration@test.com',
  phone: '+34 987 654 321',
  company: 'Integration Test Company',
  message: 'Test message for integration',
  service_type: 'mandato_venta',
  source: 'website_form',
  status: 'NEW',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

describe('LeadClosureActionDialog - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should complete full creation flow', async () => {
    const mockLead = createMockLead();
    const mockOnCreateFromLead = vi.fn().mockResolvedValue({ success: true, id: 'new-mandate-123' });
    const mockOnClose = vi.fn();

    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={mockOnClose}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Complete flow
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@test.com' } });
    
    fireEvent.click(screen.getByText('Crear Mandato de Venta'));

    await waitFor(() => {
      expect(mockOnCreateFromLead).toHaveBeenCalledWith(
        'lead-123',
        'mandato_venta',
        expect.any(Object),
        true
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('should handle navigation preferences', async () => {
    const mockLead = createMockLead();
    const mockOnCreateFromLead = vi.fn().mockResolvedValue({ success: true, id: 'new-valuation-123' });

    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Select valoración and uncheck navigation
    fireEvent.click(screen.getByLabelText('Valoración'));
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@test.com' } });
    
    const linkCheckbox = screen.getByLabelText('Vincular al lead y navegar al nuevo elemento');
    fireEvent.click(linkCheckbox);
    
    fireEvent.click(screen.getByText('Crear Valoración'));

    await waitFor(() => {
      expect(mockOnCreateFromLead).toHaveBeenCalledWith(
        'lead-123',
        'valoracion',
        expect.any(Object),
        false
      );
    });
  });

  test('should handle leads with missing data', () => {
    const leadWithoutData = createMockLead({
      company: '',
      name: '',
      email: ''
    });

    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={leadWithoutData}
        onCreateFromLead={vi.fn()}
      />
    );

    // Should show empty input fields
    expect(screen.getByLabelText('Empresa *')).toHaveValue('');
    expect(screen.getByLabelText('Contacto *')).toHaveValue('');
    expect(screen.getByLabelText('Email *')).toHaveValue('');
  });

  test('should show type-specific fields', () => {
    const mockLead = createMockLead();

    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={vi.fn()}
      />
    );

    // Test mandate fields
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    expect(screen.getByLabelText('Sector')).toBeInTheDocument();
    expect(screen.getByLabelText('Rango EBITDA')).toBeInTheDocument();

    // Test valuation fields
    fireEvent.click(screen.getByLabelText('Valoración'));
    expect(screen.getByLabelText('Propósito')).toBeInTheDocument();
    expect(screen.getByLabelText('Rango Facturación')).toBeInTheDocument();
  });

  test('should handle errors gracefully', async () => {
    const mockLead = createMockLead();
    const mockOnCreateFromLead = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <LeadClosureActionDialog
        isOpen={true}
        onClose={vi.fn()}
        lead={mockLead}
        onCreateFromLead={mockOnCreateFromLead}
      />
    );

    // Complete form and submit
    fireEvent.click(screen.getByLabelText('Mandato de Venta'));
    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@test.com' } });
    
    fireEvent.click(screen.getByText('Crear Mandato de Venta'));

    await waitFor(() => {
      expect(mockOnCreateFromLead).toHaveBeenCalled();
    });

    // Dialog should remain open on error
    expect(screen.getByText('Crear desde Lead: Integration Test Lead')).toBeInTheDocument();
  });
});