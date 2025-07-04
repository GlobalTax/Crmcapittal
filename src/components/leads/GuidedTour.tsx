import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface GuidedTourProps {
  run: boolean;
  onCallback: (data: CallBackProps) => void;
}

export const GuidedTour = ({ run, onCallback }: GuidedTourProps) => {
  const steps: Step[] = [
    {
      target: '[data-tour="create-lead"]',
      content: 'Comienza creando tu primer lead. Aquí puedes agregar información de contactos potenciales.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="stats-cards"]',
      content: 'Estas métricas te ayudan a monitorear el rendimiento de tus leads en tiempo real.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="filters"]',
      content: 'Usa estos filtros para organizar y encontrar leads específicos rápidamente.',
      placement: 'top',
    },
    {
      target: '[data-tour="leads-table"]',
      content: 'Aquí se muestran todos tus leads. Puedes asignar, convertir o gestionar cada uno.',
      placement: 'top',
    },
    {
      target: '[data-tour="suggested-actions"]',
      content: 'Cada lead muestra acciones sugeridas basadas en su estado actual.',
      placement: 'left',
    },
    {
      target: '[data-tour="tabs"]',
      content: 'Explora diferentes vistas: Dashboard general, Analytics avanzados, y Pipeline de nurturing.',
      placement: 'bottom',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={onCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: 'hsl(var(--background))',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          fontSize: '14px',
          borderRadius: '6px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
        },
      }}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
    />
  );
};