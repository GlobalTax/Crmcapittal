/**
 * M&A Schemas Validation Tests
 * 
 * Tests for the M&A object validation schemas using Vitest
 */

import { describe, it, expect } from 'vitest';
import { DealSchema, CompanySchema, ContactSchema, ActivitySchema, getProbability } from '../validation/maSchemas';

describe('M&A Schemas Validation', () => {
  describe('DealSchema', () => {
    it('should validate a valid deal', () => {
      const validDeal = {
        id: '123',
        name: 'Acquisition Target ABC',
        mandateType: 'Sell' as const,
        sector: 'Technology',
        evMin: 1000000,
        evMax: 5000000,
        stage: 'Qualified' as const,
        probabilityPct: 15, // Must match getProbability('Qualified')
        feeModel: 'percentage' as const,
        closeTargetDate: '2024-12-31',
        companyId: 'comp-123',
        contactId: 'contact-123'
      };

      const result = DealSchema.safeParse(validDeal);
      expect(result.success).toBe(true);
    });

    it('should fail when probability is incorrect for stage', () => {
      const invalidDeal = {
        id: '123',
        name: 'Acquisition Target ABC',
        mandateType: 'Sell' as const,
        sector: 'Technology',
        evMin: 1000000,
        evMax: 5000000,
        stage: 'Qualified' as const,
        probabilityPct: 50, // Should be 15 for 'Qualified' stage
      };

      const result = DealSchema.safeParse(invalidDeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('probabilidad no coincide')
        )).toBe(true);
      }
    });

    it('should fail when evMin > evMax', () => {
      const invalidDeal = {
        id: '123',
        name: 'Acquisition Target ABC',
        mandateType: 'Sell' as const,
        sector: 'Technology',
        evMin: 5000000, // Greater than evMax
        evMax: 1000000,
        stage: 'New Lead' as const,
        probabilityPct: 5,
      };

      const result = DealSchema.safeParse(invalidDeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('EV máximo debe ser mayor o igual al EV mínimo')
        )).toBe(true);
      }
    });

    it('should validate probability calculation helper', () => {
      expect(getProbability('New Lead')).toBe(5);
      expect(getProbability('Qualified')).toBe(15);
      expect(getProbability('NDA Sent')).toBe(25);
      expect(getProbability('NDA Signed')).toBe(30);
      expect(getProbability('Info Shared')).toBe(40);
      expect(getProbability('Negotiation')).toBe(70);
      expect(getProbability('Mandate Signed')).toBe(100);
      expect(getProbability('Closed Lost')).toBe(0);
      expect(getProbability('Unknown Stage')).toBe(0);
    });
  });

  describe('CompanySchema', () => {
    it('should validate a valid company', () => {
      const validCompany = {
        id: 'comp-123',
        name: 'Tech Company S.L.',
        sector: 'Technology',
        country: 'Spain',
        ebitdaLtm: 2000000,
        ingresos_ltm: 10000000,
        website: 'https://www.techcompany.com'
      };

      const result = CompanySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid website URL', () => {
      const invalidCompany = {
        id: 'comp-123',
        name: 'Tech Company S.L.',
        sector: 'Technology',
        country: 'Spain',
        website: 'invalid-url'
      };

      const result = CompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });
  });

  describe('ContactSchema', () => {
    it('should validate a valid contact', () => {
      const validContact = {
        id: 'contact-123',
        name: 'John Doe',
        email: 'john.doe@techcompany.com',
        phone: '+34 600 123 456',
        role: 'CEO',
        influence: 5,
        language: 'Spanish',
        companyId: 'comp-123'
      };

      const result = ContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidContact = {
        id: 'contact-123',
        name: 'John Doe',
        email: 'invalid-email'
      };

      const result = ContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it('should fail with influence out of range', () => {
      const invalidContact = {
        id: 'contact-123',
        name: 'John Doe',
        email: 'john.doe@techcompany.com',
        influence: 10 // Should be between 0-5
      };

      const result = ContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });
  });

  describe('ActivitySchema', () => {
    it('should validate a valid activity', () => {
      const validActivity = {
        id: 'activity-123',
        type: 'call' as const,
        title: 'Initial Discovery Call',
        description: 'Discussed acquisition interest and next steps',
        result: 'Positive - interested in proceeding',
        nextStep: 'Send NDA for signature',
        dueDate: '2024-01-15T10:00:00Z',
        dealId: 'deal-123',
        contactId: 'contact-123'
      };

      const result = ActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid activity type', () => {
      const invalidActivity = {
        id: 'activity-123',
        type: 'invalid-type',
        title: 'Initial Discovery Call'
      };

      const result = ActivitySchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });
});