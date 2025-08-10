// Configuración centralizada de integraciones y automatizaciones
// Todas desactivadas por defecto hasta su activación explícita

export const INTEGRATIONS_CONFIG = {
  automations: {
    enabled: false,
  },
  slack: {
    enabled: false,
  },
  docusign: {
    enabled: false,
    templateIds: {
      nda: '',
      mandate: '',
    },
  },
  zoom: {
    enabled: false,
  },
} as const;

export type IntegrationsConfig = typeof INTEGRATIONS_CONFIG;
