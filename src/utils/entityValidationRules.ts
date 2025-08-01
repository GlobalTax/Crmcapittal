import { ValidationRules } from '@/contexts/FormValidationContext';

export const leadValidationRules: ValidationRules = {
  name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  owner_id: { 
    required: true 
  },
  email: { 
    format: 'email' 
  },
  phone: { 
    format: 'phone' 
  }
};

// At least one contact method required for leads
export const leadContactValidationRules: ValidationRules = {
  email: { 
    atLeastOne: ['email', 'phone'],
    format: 'email' 
  },
  phone: { 
    atLeastOne: ['email', 'phone'],
    format: 'phone' 
  }
};

export const mandateValidationRules: ValidationRules = {
  mandate_name: { 
    required: true, 
    minLength: 5,
    maxLength: 200 
  },
  client_name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  client_contact: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  target_sectors: { 
    required: true 
  }
};

export const reconversionValidationRules: ValidationRules = {
  company_name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  contact_name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  email: { 
    format: 'email' 
  },
  phone: { 
    format: 'phone' 
  },
  annual_revenue: { 
    min: 0 
  },
  ebitda: { 
    min: 0 
  }
};

// At least one contact method and one financial metric required for reconversions
export const reconversionContactValidationRules: ValidationRules = {
  email: { 
    atLeastOne: ['email', 'phone'],
    format: 'email' 
  },
  phone: { 
    atLeastOne: ['email', 'phone'],
    format: 'phone' 
  }
};

export const reconversionFinancialValidationRules: ValidationRules = {
  annual_revenue: { 
    atLeastOne: ['annual_revenue', 'ebitda'],
    min: 0 
  },
  ebitda: { 
    atLeastOne: ['annual_revenue', 'ebitda'],
    min: 0 
  }
};

export const valoracionValidationRules: ValidationRules = {
  company_name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  client_name: { 
    required: true, 
    minLength: 2,
    maxLength: 100 
  },
  client_email: { 
    format: 'email' 
  }
};

export const caseValidationRules: ValidationRules = {
  title: { 
    required: true, 
    minLength: 5,
    maxLength: 200 
  },
  contact_id: { 
    required: true 
  },
  practice_area_id: { 
    required: true 
  }
};

// Combined validation rules that merge individual and cross-field rules
export const getLeadValidationRules = (): ValidationRules => ({
  ...leadValidationRules,
  ...leadContactValidationRules
});

export const getReconversionValidationRules = (): ValidationRules => ({
  ...reconversionValidationRules,
  ...reconversionContactValidationRules,
  ...reconversionFinancialValidationRules
});