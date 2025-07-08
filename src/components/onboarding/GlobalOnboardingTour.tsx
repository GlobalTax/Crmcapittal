import React from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { OnboardingStep } from '@/types/Onboarding';

interface GlobalOnboardingTourProps {
  steps: OnboardingStep[];
  run: boolean;
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
}

export const GlobalOnboardingTour = ({ 
  steps, 
  run, 
  stepIndex, 
  onCallback 
}: GlobalOnboardingTourProps) => {
  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc
      callback={onCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          arrowColor: 'hsl(var(--background))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid hsl(var(--border))',
          fontSize: '14px',
          maxWidth: '400px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: 'hsl(var(--foreground))',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px',
        },
        tooltipContent: {
          color: 'hsl(var(--muted-foreground))',
          lineHeight: '1.5',
          padding: '0',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
        },
        buttonBack: {
          backgroundColor: 'transparent',
          color: 'hsl(var(--muted-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '8px',
          transition: 'all 0.2s',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: 'hsl(var(--muted-foreground))',
          border: 'none',
          padding: '8px 12px',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        },
        buttonClose: {
          backgroundColor: 'transparent',
          border: 'none',
          color: 'hsl(var(--muted-foreground))',
          cursor: 'pointer',
          padding: '4px',
          position: 'absolute',
          right: '8px',
          top: '8px',
          width: '24px',
          height: '24px',
        },
        spotlight: {
          borderRadius: '4px',
        },
        overlay: {
          mixBlendMode: 'normal',
        },
        overlayLegacy: {
          mixBlendMode: 'normal',
        }
      }}
      locale={{
        back: 'Anterior',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        nextLabelWithProgress: 'Siguiente ({{step}} de {{steps}})',
        open: 'Abrir diálogo',
        skip: 'Saltar guía',
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};