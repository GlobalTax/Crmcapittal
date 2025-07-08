export interface OnboardingStep {
  id: string;
  name: string;
  title: string;
  content: string;
  target: string;
  page?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  hideCloseButton?: boolean;
  hideSkipButton?: boolean;
  showProgress?: boolean;
  spotlightClicks?: boolean;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  step_id: string;
  step_name: string;
  completed_at: string;
  created_at: string;
  step_data?: Record<string, any>;
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  completedSteps: string[];
  showWelcomeModal: boolean;
  isComplete: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    name: 'Bienvenida',
    title: '¡Bienvenido a tu CRM!',
    content: 'Te guiaremos por las funciones principales para que puedas gestionar tus leads y convertirlos en clientes.',
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    hideCloseButton: true,
    showProgress: true
  },
  {
    id: 'leads-arrival',
    name: 'Llegada de Leads',
    title: '📥 Así llegan los leads',
    content: 'Aquí verás todos los leads que llegan a tu CRM. Puedes gestionarlos, filtrarlos y convertirlos en oportunidades.',
    target: '[data-tour="leads-section"]',
    page: '/leads',
    placement: 'bottom',
    showProgress: true
  },
  {
    id: 'lead-conversion',
    name: 'Conversión de Leads',
    title: '👤 Cómo convertir un lead en cliente',
    content: 'Usa este botón para convertir un lead calificado en una oportunidad de negocio. Es el primer paso del proceso de ventas.',
    target: '[data-tour="convert-lead-button"]',
    page: '/leads',
    placement: 'top',
    showProgress: true
  },
  {
    id: 'opportunities-view',
    name: 'Vista de Oportunidades',
    title: '📊 Dónde ver tus oportunidades',
    content: 'En esta sección verás todas tus oportunidades organizadas por etapa. Aquí gestionas el pipeline de ventas.',
    target: '[data-tour="deals-section"]',
    page: '/deals',
    placement: 'bottom',
    showProgress: true
  },
  {
    id: 'document-generation',
    name: 'Generación de Documentos',
    title: '📄 Cómo generar documentos',
    content: 'Genera propuestas, NDAs y otros documentos automáticamente usando nuestros templates inteligentes.',
    target: '[data-tour="generate-document-button"]',
    page: '/deals',
    placement: 'top',
    showProgress: true
  },
  {
    id: 'notifications-alerts',
    name: 'Notificaciones y Alertas',
    title: '🚨 Dónde ver alertas y notificaciones',
    content: 'Mantente al día con todas las actividades importantes. Aquí recibirás notificaciones de nuevos leads, documentos firmados y más.',
    target: '[data-tour="notifications-center"]',
    page: '/dashboard',
    placement: 'bottom',
    showProgress: true
  },
  {
    id: 'client-conversion',
    name: 'Conversión a Cliente',
    title: '✅ Qué significa convertir un lead en cliente',
    content: 'Una vez firmados los documentos, puedes convertir la oportunidad en cliente activo. Esto actualiza automáticamente todos los registros.',
    target: '[data-tour="convert-to-client-button"]',
    page: '/deals',
    placement: 'top',
    showProgress: true,
    spotlightClicks: true
  }
];