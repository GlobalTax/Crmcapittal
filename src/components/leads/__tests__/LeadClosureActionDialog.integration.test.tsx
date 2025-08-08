import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LeadClosureActionDialog } from '../LeadClosureActionDialog';
import type { Lead } from '@/types/Lead';

// Mock hooks with more realistic implementations
const mockCreateBuyingMandate = vi.fn();
const mockCreateValoracion = vi.fn();
const mockSupabaseRpc = vi.fn();

vi.mock('@/hooks/useBuyingMandates', () => ({
  useBuyingMandates: () => ({
    createBuyingMandate: mockCreateBuyingMandate,
  }),
}));

vi.mock('@/hooks/useValoraciones', () => ({
  useValoraciones: () => ({
    createValoracion: mockCreateValoracion,
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mockSupabaseRpc,
  },
}));

vi.mock('@/services/analyticsService', () => ({
  analyticsService: {
    track: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create realistic lead
const createRealisticLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'lead-abc123',
  name: 'María García',
  email: 'maria.garcia@empresatech.com',
  company_name: 'EmpresaTech Solutions',
  sector_id: 'technology',
  service_type: 'mandato_venta',
  phone: '+34 610 123 456',
  source: 'linkedin',
  status: 'QUALIFIED',
  pipeline_stage_id: 'stage-qualified',
  probability: 45,
  deal_value: 2500000,
  position: 'CEO',
  priority: 'HIGH',
  quality: 'EXCELLENT',
  message: 'Interesados en vender la empresa por expansión a nuevos mercados',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-20T14:22:00Z',
  owner_id: 'user-owner-123',
  assigned_to_id: 'user-assigned-456',
  tags: ['hot-lead', 'enterprise'],
  lead_score: 85,
  ...overrides,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LeadClosureActionDialog - Integration Tests', () => {
  let realisticLead: Lead;
  let mockOnOpenChange: ReturnType<typeof vi.fn>;
  let mockOnCreated: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    realisticLead = createRealisticLead();
    mockOnOpenChange = vi.fn();
    mockOnCreated = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Dialog rendering with realistic lead data', () => {
    it('should render complete lead information correctly', () => {
      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={realisticLead}
          />
        </TestWrapper>
      );

      // Check lead summary section
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('EmpresaTech Solutions')).toBeInTheDocument();
      expect(screen.getByText('maria.garcia@empresatech.com')).toBeInTheDocument();
      expect(screen.getByText('+34 610 123 456')).toBeInTheDocument();

      // Check metadata
      expect(screen.getByText(/Valor estimado.*€2\.5M/)).toBeInTheDocument();
      expect(screen.getByText(/Probability.*45%/)).toBeInTheDocument();
      expect(screen.getByText(/Score.*85/)).toBeInTheDocument();

      // Check message/notes
      expect(screen.getByText(/Interesados en vender la empresa/)).toBeInTheDocument();

      // Check default recommendation based on service_type
      expect(screen.getByText('Mandato de Venta')).toBeInTheDocument();
      expect(screen.getByText('Recomendado')).toBeInTheDocument();
    });

    it('should render properly when company or contact info is missing', () => {
      const incompleteLeadWithCompany = createRealisticLead({
        name: '',
        email: '',
        company_name: 'Solo Empresa Inc',
        phone: '',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={incompleteLeadWithCompany}
          />
        </TestWrapper>
      );

      // Should show company name prominently when contact info is missing
      expect(screen.getByText('Solo Empresa Inc')).toBeInTheDocument();
      
      // Should show inline input fields for missing contact data
      expect(screen.getByPlaceholderText('Nombre del contacto')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email del contacto')).toBeInTheDocument();
    });

    it('should render inline inputs when both company and contact missing', () => {
      const minimalLead = createRealisticLead({
        name: '',
        email: '',
        company_name: '',
        phone: '',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={minimalLead}
          />
        </TestWrapper>
      );

      // Should show all inline input fields
      expect(screen.getByPlaceholderText('Nombre del contacto')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email del contacto')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nombre de la empresa')).toBeInTheDocument();
    });
  });

  describe('Complete user flows', () => {
    it('should complete "create and open" flow successfully', async () => {
      mockSupabaseRpc.mockResolvedValue({ data: 'mandate-new-123', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={realisticLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      // Default should be sell mandate (based on service_type)
      expect(screen.getByText('Mandato de Venta')).toBeInTheDocument();

      // Ensure "Link to lead" is checked
      const linkCheckbox = screen.getByRole('checkbox', { name: /Vincular al lead/i });
      expect(linkCheckbox).toBeChecked();

      // Click create button
      const createButton = screen.getByText('Crear Mandato de Venta');
      fireEvent.click(createButton);

      // Verify RPC call
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('create_entity_from_lead', {
          p_lead_id: 'lead-abc123',
          p_type: 'sell',
          p_payload: expect.objectContaining({
            client_name: 'María García',
            client_email: 'maria.garcia@empresatech.com',
            mandate_name: expect.stringContaining('Mandato de Venta'),
          }),
          p_link: true,
        });
      });

      // Verify success callback
      await waitFor(() => {
        expect(mockOnCreated).toHaveBeenCalledWith({
          type: 'sell',
          id: 'mandate-new-123',
          linkToLead: true,
        });
      });

      // Dialog should close
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should complete "create and stay" flow (unlink from lead)', async () => {
      mockSupabaseRpc.mockResolvedValue({ data: 'valoracion-789', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={realisticLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      // Switch to valuation
      fireEvent.click(screen.getByText('Valoración'));

      // Uncheck "Link to lead"
      const linkCheckbox = screen.getByRole('checkbox', { name: /Vincular al lead/i });
      fireEvent.click(linkCheckbox);
      expect(linkCheckbox).not.toBeChecked();

      // Create
      fireEvent.click(screen.getByText('Crear Valoración'));

      // Verify RPC call without linking
      await waitFor(() => {
        expect(mockSupabaseRpc).toHaveBeenCalledWith('create_entity_from_lead', {
          p_lead_id: 'lead-abc123',
          p_type: 'valuation',
          p_payload: expect.objectContaining({
            client_name: 'María García',
            company_name: 'EmpresaTech Solutions',
          }),
          p_link: false,
        });
      });

      // Verify callback with linkToLead = false
      await waitFor(() => {
        expect(mockOnCreated).toHaveBeenCalledWith({
          type: 'valuation',
          id: 'valoracion-789',
          linkToLead: false,
        });
      });
    });

    it('should handle "close without creating" flow', async () => {
      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={realisticLead}
          />
        </TestWrapper>
      );

      // Click close/cancel using X button
      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeButton);

      // Should close dialog without any creation
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockSupabaseRpc).not.toHaveBeenCalled();
      expect(mockOnCreated).not.toHaveBeenCalled();
    });

    it('should handle validation errors in inline inputs', async () => {
      const emptyLead = createRealisticLead({
        name: '',
        email: '',
        company_name: '',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={emptyLead}
          />
        </TestWrapper>
      );

      // Try to create without filling required fields
      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      });

      // RPC should not be called
      expect(mockSupabaseRpc).not.toHaveBeenCalled();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle creation errors gracefully', async () => {
      const { toast } = require('sonner');
      mockSupabaseRpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Validation failed: Missing required field' } 
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={realisticLead}
          />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Crear Mandato de Venta'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Validation failed')
        );
      });

      // Dialog should remain open
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
      expect(mockOnCreated).not.toHaveBeenCalled();
    });

    it('should handle extremely long lead data', () => {
      const longDataLead = createRealisticLead({
        name: 'María del Carmen García González de la Torre y Hernández López',
        company_name: 'EmpresaTech Solutions Innovadoras para el Desarrollo Tecnológico Empresarial Internacional SL',
        message: 'Esta es una descripción extremadamente larga que simula un mensaje muy detallado del lead que incluye información específica sobre la empresa, sus objetivos, expectativas, timeline, presupuesto y muchos otros detalles relevantes para la operación de M&A que se está considerando y que requiere un tratamiento especial por parte del equipo comercial.',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={longDataLead}
          />
        </TestWrapper>
      );

      // Should handle long data without breaking layout
      expect(screen.getByText(/María del Carmen García/)).toBeInTheDocument();
      expect(screen.getByText(/EmpresaTech Solutions/)).toBeInTheDocument();
      expect(screen.getByText(/Esta es una descripción extremadamente larga/)).toBeInTheDocument();
    });
  });
});