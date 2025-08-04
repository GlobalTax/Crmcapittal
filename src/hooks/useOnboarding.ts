import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ONBOARDING_STEPS, OnboardingState } from '@/types/Onboarding';

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    completedSteps: [],
    showWelcomeModal: false,
    isComplete: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check user's onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('supabase-user');
      if (!user) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      // Simple localStorage-based onboarding status
      const onboardingComplete = localStorage.getItem(`onboarding-${userId}`) === 'true';
      
      setState(prev => ({
        ...prev,
        completedSteps: [],
        isComplete: onboardingComplete,
        showWelcomeModal: !onboardingComplete
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setLoading(false);
    }
  }, []);

  // Start onboarding tour
  const startTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
      showWelcomeModal: false
    }));

    // Navigate to first step page if needed
    const firstStep = ONBOARDING_STEPS[0];
    if (firstStep.page && window.location.pathname !== firstStep.page) {
      navigate(firstStep.page);
    }
  }, [navigate]);

  // Complete a step
  const completeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])]
    }));
  }, []);

  // Complete entire onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      const user = localStorage.getItem('supabase-user');
      if (user) {
        const userData = JSON.parse(user);
        localStorage.setItem(`onboarding-${userData.id}`, 'true');
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        isComplete: true,
        showWelcomeModal: false
      }));

      toast({
        title: "¡Onboarding completado!",
        description: "Ya conoces las funciones principales del CRM. ¡A vender!",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [toast]);

  // Reset onboarding (for reactivation)
  const resetOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: false,
      showWelcomeModal: true
    }));
  }, []);

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      showWelcomeModal: false,
      isActive: false
    }));
  }, []);

  // Navigate to step page
  const navigateToStep = useCallback((stepIndex: number) => {
    const step = ONBOARDING_STEPS[stepIndex];
    if (step?.page && window.location.pathname !== step.page) {
      navigate(step.page);
    }
  }, [navigate]);

  // Handle tour callback
  const handleTourCallback = useCallback((data: any) => {
    const { action, index, status, type } = data;

    if (type === 'step:after') {
      const currentStep = ONBOARDING_STEPS[index];
      if (currentStep) {
        completeStep(currentStep.id);
      }
    }

    if (action === 'next' && index < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[index + 1];
      if (nextStep?.page && window.location.pathname !== nextStep.page) {
        navigate(nextStep.page);
      }
      setState(prev => ({ ...prev, currentStep: index + 1 }));
    }

    if (action === 'prev' && index > 0) {
      const prevStep = ONBOARDING_STEPS[index - 1];
      if (prevStep?.page && window.location.pathname !== prevStep.page) {
        navigate(prevStep.page);
      }
      setState(prev => ({ ...prev, currentStep: index - 1 }));
    }

    if (status === 'finished' || status === 'skipped') {
      if (status === 'finished') {
        completeOnboarding();
      } else {
        setState(prev => ({ ...prev, isActive: false }));
      }
    }
  }, [completeStep, completeOnboarding, navigate]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    ...state,
    loading,
    steps: ONBOARDING_STEPS,
    startTour,
    completeStep,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
    navigateToStep,
    handleTourCallback,
    checkOnboardingStatus
  };
};