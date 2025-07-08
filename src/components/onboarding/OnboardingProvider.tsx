import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingWelcomeModal } from './OnboardingWelcomeModal';
import { GlobalOnboardingTour } from './GlobalOnboardingTour';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const {
    isActive,
    currentStep,
    showWelcomeModal,
    steps,
    startTour,
    skipOnboarding,
    handleTourCallback
  } = useOnboarding();

  return (
    <>
      {children}
      
      {/* Welcome Modal */}
      <OnboardingWelcomeModal
        open={showWelcomeModal}
        onStartTour={startTour}
        onSkip={skipOnboarding}
      />

      {/* Interactive Tour */}
      <GlobalOnboardingTour
        steps={steps}
        run={isActive}
        stepIndex={currentStep}
        onCallback={handleTourCallback}
      />
    </>
  );
};