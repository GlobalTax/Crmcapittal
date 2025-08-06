/**
 * Deal Stage Service Tests
 * 
 * Tests for the M&A pipeline stage management functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getProbability, 
  getNextStage, 
  getPreviousStage,
  getAllStages,
  getStageInfo,
  isValidStage,
  getDefaultStage,
  isFinalStage,
  reloadPipeline
} from '../services/dealStage.js';

describe('Deal Stage Service', () => {
  beforeEach(() => {
    // Recargar pipeline cache antes de cada test
    reloadPipeline();
  });

  describe('getProbability', () => {
    it('should return correct probability for valid stages', () => {
      expect(getProbability('New Lead')).toBe(5);
      expect(getProbability('Qualified')).toBe(15);
      expect(getProbability('NDA Sent')).toBe(25);
      expect(getProbability('NDA Signed')).toBe(30);
      expect(getProbability('Info Shared')).toBe(40);
      expect(getProbability('Negotiation')).toBe(70);
      expect(getProbability('Mandate Signed')).toBe(100);
      expect(getProbability('Closed Lost')).toBe(0);
    });

    it('should return 0 for invalid stages', () => {
      expect(getProbability('Invalid Stage')).toBe(0);
      expect(getProbability('')).toBe(0);
      expect(getProbability(null)).toBe(0);
      expect(getProbability(undefined)).toBe(0);
      expect(getProbability(123)).toBe(0);
    });

    it('should be case sensitive', () => {
      expect(getProbability('new lead')).toBe(0);
      expect(getProbability('NEW LEAD')).toBe(0);
      expect(getProbability('New Lead')).toBe(5);
    });
  });

  describe('getNextStage', () => {
    it('should return correct next stage for valid stages', () => {
      expect(getNextStage('New Lead')).toBe('Qualified');
      expect(getNextStage('Qualified')).toBe('NDA Sent');
      expect(getNextStage('NDA Sent')).toBe('NDA Signed');
      expect(getNextStage('NDA Signed')).toBe('Info Shared');
      expect(getNextStage('Info Shared')).toBe('Negotiation');
      expect(getNextStage('Negotiation')).toBe('Mandate Signed');
    });

    it('should return null for final stages', () => {
      expect(getNextStage('Mandate Signed')).toBe(null);
      expect(getNextStage('Closed Lost')).toBe(null);
    });

    it('should return null for invalid stages', () => {
      expect(getNextStage('Invalid Stage')).toBe(null);
      expect(getNextStage('')).toBe(null);
      expect(getNextStage(null)).toBe(null);
      expect(getNextStage(undefined)).toBe(null);
      expect(getNextStage(123)).toBe(null);
    });
  });

  describe('getPreviousStage', () => {
    it('should return correct previous stage for valid stages', () => {
      expect(getPreviousStage('Qualified')).toBe('New Lead');
      expect(getPreviousStage('NDA Sent')).toBe('Qualified');
      expect(getPreviousStage('NDA Signed')).toBe('NDA Sent');
      expect(getPreviousStage('Info Shared')).toBe('NDA Signed');
      expect(getPreviousStage('Negotiation')).toBe('Info Shared');
      expect(getPreviousStage('Mandate Signed')).toBe('Negotiation');
      expect(getPreviousStage('Closed Lost')).toBe('Negotiation'); // Closed Lost viene después de Negotiation
    });

    it('should return null for first stage', () => {
      expect(getPreviousStage('New Lead')).toBe(null);
    });

    it('should return null for invalid stages', () => {
      expect(getPreviousStage('Invalid Stage')).toBe(null);
      expect(getPreviousStage('')).toBe(null);
      expect(getPreviousStage(null)).toBe(null);
      expect(getPreviousStage(undefined)).toBe(null);
    });
  });

  describe('getAllStages', () => {
    it('should return all active stages in correct order', () => {
      const stages = getAllStages();
      
      expect(stages).toHaveLength(8);
      expect(stages[0].name).toBe('New Lead');
      expect(stages[1].name).toBe('Qualified');
      expect(stages[2].name).toBe('NDA Sent');
      expect(stages[3].name).toBe('NDA Signed');
      expect(stages[4].name).toBe('Info Shared');
      expect(stages[5].name).toBe('Negotiation');
      expect(stages[6].name).toBe('Mandate Signed');
      expect(stages[7].name).toBe('Closed Lost');
      
      // Verificar que todos tienen isActive = true
      stages.forEach(stage => {
        expect(stage.isActive).toBe(true);
      });
    });

    it('should return stages sorted by order', () => {
      const stages = getAllStages();
      
      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i].order).toBeLessThan(stages[i + 1].order);
      }
    });
  });

  describe('getStageInfo', () => {
    it('should return complete stage information for valid stages', () => {
      const stageInfo = getStageInfo('New Lead');
      
      expect(stageInfo).toMatchObject({
        id: 1,
        name: 'New Lead',
        description: 'Captura inicial (web, referral, evento)',
        probabilityPct: 5,
        order: 1,
        isActive: true
      });
    });

    it('should return null for invalid stages', () => {
      expect(getStageInfo('Invalid Stage')).toBe(null);
      expect(getStageInfo('')).toBe(null);
      expect(getStageInfo(null)).toBe(null);
      expect(getStageInfo(undefined)).toBe(null);
    });
  });

  describe('isValidStage', () => {
    it('should return true for valid active stages', () => {
      expect(isValidStage('New Lead')).toBe(true);
      expect(isValidStage('Qualified')).toBe(true);
      expect(isValidStage('NDA Sent')).toBe(true);
      expect(isValidStage('NDA Signed')).toBe(true);
      expect(isValidStage('Info Shared')).toBe(true);
      expect(isValidStage('Negotiation')).toBe(true);
      expect(isValidStage('Mandate Signed')).toBe(true);
      expect(isValidStage('Closed Lost')).toBe(true);
    });

    it('should return false for invalid stages', () => {
      expect(isValidStage('Invalid Stage')).toBe(false);
      expect(isValidStage('')).toBe(false);
      expect(isValidStage(null)).toBe(false);
      expect(isValidStage(undefined)).toBe(false);
      expect(isValidStage(123)).toBe(false);
    });
  });

  describe('getDefaultStage', () => {
    it('should return the default stage', () => {
      expect(getDefaultStage()).toBe('New Lead');
    });
  });

  describe('isFinalStage', () => {
    it('should return true for final stages', () => {
      expect(isFinalStage('Mandate Signed')).toBe(true);
      expect(isFinalStage('Closed Lost')).toBe(true);
    });

    it('should return false for non-final stages', () => {
      expect(isFinalStage('New Lead')).toBe(false);
      expect(isFinalStage('Qualified')).toBe(false);
      expect(isFinalStage('NDA Sent')).toBe(false);
      expect(isFinalStage('NDA Signed')).toBe(false);
      expect(isFinalStage('Info Shared')).toBe(false);
      expect(isFinalStage('Negotiation')).toBe(false);
    });

    it('should return false for invalid stages', () => {
      expect(isFinalStage('Invalid Stage')).toBe(false);
      expect(isFinalStage('')).toBe(false);
      expect(isFinalStage(null)).toBe(false);
      expect(isFinalStage(undefined)).toBe(false);
    });
  });
});