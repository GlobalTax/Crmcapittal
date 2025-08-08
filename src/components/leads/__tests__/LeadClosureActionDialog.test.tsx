import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LeadClosureActionDialog, type LeadClosureType } from '../LeadClosureActionDialog';
import type { Lead } from '@/types/Lead';

// Mock dependencies
vi.mock('@/hooks/useBuyingMandates', () => ({
  useBuyingMandates: () => ({
    createBuyingMandate: vi.fn().mockResolvedValue({ id: 'mandate-123' }),
  }),
}));

vi.mock('@/hooks/useValoraciones', () => ({
  useValoraciones: () => ({
    createValoracion: vi.fn().mockResolvedValue({ id: 'valoracion-123' }),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
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

// Helper to create mock lead
const createMockLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'lead-123',
  name: 'John Doe',
  email: 'john@example.com',
  company_name: 'Test Company',
  sector_id: 'tech',
  service_type: 'valoracion_empresa',
  phone: '+34 600 000 000',
  source: 'website_form',
  status: 'NEW',
  pipeline_stage_id: 'stage-1',
  probability: 25,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Test wrapper component
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

describe('LeadClosureActionDialog - Unit Tests', () => {
  let mockLead: Lead;
  let mockOnOpenChange: ReturnType<typeof vi.fn>;
  let mockOnCreated: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLead = createMockLead();
    mockOnOpenChange = vi.fn();
    mockOnCreated = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('suggest() - keyword matrix to type recommendation', () => {
    it('should recommend "sell" for sell-related keywords', () => {
      const sellLead = createMockLead({
        service_type: 'mandato_venta',
        company_name: 'Selling Corp',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={sellLead}
          />
        </TestWrapper>
      );

      // The component should auto-select 'sell' type based on keywords
      expect(screen.getByText('Mandato de Venta')).toBeInTheDocument();
    });

    it('should recommend "buy" for buy-related keywords', () => {
      const buyLead = createMockLead({
        service_type: 'mandato_compra',
        company_name: 'Buyer Inc',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={buyLead}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Mandato de Compra')).toBeInTheDocument();
    });

    it('should recommend "valuation" as default for unclear keywords', () => {
      const neutralLead = createMockLead({
        service_type: 'valoracion_empresa',
        company_name: 'Neutral Corp',
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={neutralLead}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Valoración')).toBeInTheDocument();
    });

    it('should handle edge cases - empty or null fields', () => {
      const emptyLead = createMockLead({
        service_type: undefined,
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

      // Should default to valuation
      expect(screen.getByText('Valoración')).toBeInTheDocument();
    });
  });

  describe('buildPayload() - correct mapping by type', () => {
    it('should build correct payload for buy mandate', () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValue({ data: 'mandate-123', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      // Select buy type
      fireEvent.click(screen.getByText('Mandato de Compra'));
      
      // Fill additional fields if needed and submit
      const createButton = screen.getByText('Crear Mandato de Compra');
      fireEvent.click(createButton);

      waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('create_entity_from_lead', {
          p_lead_id: 'lead-123',
          p_type: 'buy',
          p_payload: expect.objectContaining({
            client_name: 'John Doe',
            mandate_name: expect.stringContaining('Mandato de Compra'),
            target_sectors: [],
            target_locations: [],
          }),
          p_link: true,
        });
      });
    });

    it('should build correct payload for sell mandate', () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValue({ data: 'mandate-123', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      // Select sell type
      fireEvent.click(screen.getByText('Mandato de Venta'));
      
      const createButton = screen.getByText('Crear Mandato de Venta');
      fireEvent.click(createButton);

      waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('create_entity_from_lead', {
          p_lead_id: 'lead-123',
          p_type: 'sell',
          p_payload: expect.objectContaining({
            client_name: 'John Doe',
            mandate_name: expect.stringContaining('Mandato de Venta'),
          }),
          p_link: true,
        });
      });
    });

    it('should build correct payload for valuation', () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValue({ data: 'valoracion-123', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      // Select valuation type (should be default)
      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('create_entity_from_lead', {
          p_lead_id: 'lead-123',
          p_type: 'valuation',
          p_payload: expect.objectContaining({
            client_name: 'John Doe',
            company_name: 'Test Company',
            priority: 'medium',
            status: 'requested',
          }),
          p_link: true,
        });
      });
    });
  });

  describe('createFromLead() - RPC calls and error handling', () => {
    it('should handle successful creation', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      supabase.rpc.mockResolvedValue({ data: 'new-entity-123', error: null });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
            onCreated={mockOnCreated}
          />
        </TestWrapper>
      );

      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnCreated).toHaveBeenCalledWith({
          type: 'valuation',
          id: 'new-entity-123',
          linkToLead: true,
        });
      });

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should handle RPC errors gracefully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      supabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      });

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
          />
        </TestWrapper>
      );

      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Database connection failed')
        );
      });

      // Dialog should remain open on error
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('should handle network errors', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      const { toast } = require('sonner');
      
      supabase.rpc.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
          />
        </TestWrapper>
      );

      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Network error')
        );
      });
    });

    it('should show loading state during creation', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      // Mock a slow response
      supabase.rpc.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: 'entity-123', error: null }), 100)
        )
      );

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
          />
        </TestWrapper>
      );

      const createButton = screen.getByText('Crear Valoración');
      fireEvent.click(createButton);

      // Should show loading state
      expect(screen.getByText('Creando...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Creando...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Analytics tracking', () => {
    it('should track dialog opened event', () => {
      const { analyticsService } = require('@/services/analyticsService');

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
          />
        </TestWrapper>
      );

      expect(analyticsService.track).toHaveBeenCalledWith('lead_closure_dialog_opened', {
        lead_id: 'lead-123',
        lead_source: 'website_form',
        company_name: 'Test Company',
      });
    });

    it('should track type selection changes', () => {
      const { analyticsService } = require('@/services/analyticsService');

      render(
        <TestWrapper>
          <LeadClosureActionDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            lead={mockLead}
          />
        </TestWrapper>
      );

      // Clear initial tracking calls
      vi.clearAllMocks();

      // Change selection
      fireEvent.click(screen.getByText('Mandato de Compra'));

      expect(analyticsService.track).toHaveBeenCalledWith('lead_closure_type_selected', {
        lead_id: 'lead-123',
        selected_type: 'buy',
        recommended_type: 'valuation',
        selection_time_ms: expect.any(Number),
      });
    });
  });
});