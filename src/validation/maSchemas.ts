/**
 * M&A Objects Validation Schemas using Zod
 * 
 * Provides validation schemas for Deal, Company, Contact, and Activity entities
 * with custom business rules for the M&A CRM platform
 */

import { z } from 'zod';

// Helper function to get probability based on stage
export const getProbability = (stage: string): number => {
  const stageProbabilities: Record<string, number> = {
    'New Lead': 5,
    'Qualified': 15,
    'NDA Sent': 25,
    'NDA Signed': 30,
    'Info Shared': 40,
    'Negotiation': 70,
    'Mandate Signed': 100,
    'Closed Lost': 0
  };
  return stageProbabilities[stage] || 0;
};

// Deal Schema with custom validations
export const DealSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  mandateType: z.enum(['Sell', 'Buy'], {
    errorMap: () => ({ message: 'Tipo de mandato debe ser Sell o Buy' })
  }),
  sector: z.string().min(1, 'Sector es requerido'),
  evMin: z.number().min(0, 'EV mínimo debe ser mayor o igual a 0'),
  evMax: z.number().min(0, 'EV máximo debe ser mayor o igual a 0'),
  stage: z.enum([
    'New Lead',
    'Qualified', 
    'NDA Sent',
    'NDA Signed',
    'Info Shared',
    'Negotiation',
    'Mandate Signed',
    'Closed Lost'
  ], {
    errorMap: () => ({ message: 'Stage inválido' })
  }),
  probabilityPct: z.number().min(0).max(100, 'Probabilidad debe estar entre 0 y 100'),
  feeModel: z.enum(['percentage', 'fixed']).optional(),
  closeTargetDate: z.string().optional(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
}).refine((data) => data.evMax >= data.evMin, {
  message: 'EV máximo debe ser mayor o igual al EV mínimo',
  path: ['evMax']
}).refine((data) => {
  const expectedProbability = getProbability(data.stage);
  return data.probabilityPct === expectedProbability;
}, {
  message: 'La probabilidad no coincide con el stage seleccionado',
  path: ['probabilityPct']
});

// Company Schema
export const CompanySchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(2, 'Nombre de empresa debe tener al menos 2 caracteres'),
  sector: z.string().min(1, 'Sector es requerido'),
  country: z.string().min(2, 'País es requerido'),
  ebitdaLtm: z.number().optional(),
  ingresos_ltm: z.number().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Contact Schema
export const ContactSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.string().optional(),
  influence: z.number().min(0).max(5, 'Influencia debe estar entre 0 y 5').optional(),
  language: z.string().optional(),
  companyId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Activity Schema
export const ActivitySchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  type: z.enum(['call', 'email', 'meeting'], {
    errorMap: () => ({ message: 'Tipo debe ser call, email o meeting' })
  }),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().optional(),
  result: z.string().optional(),
  nextStep: z.string().optional(),
  dueDate: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Export schemas object for easy import
export const maSchemas = {
  DealSchema,
  CompanySchema,
  ContactSchema,
  ActivitySchema
};

export type Deal = z.infer<typeof DealSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Activity = z.infer<typeof ActivitySchema>;