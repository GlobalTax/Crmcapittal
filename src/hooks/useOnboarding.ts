import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ONBOARDING_STEPS, OnboardingState, OnboardingProgress } from '@/types/Onboarding';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Get completed steps
      const { data: progress, error: progressError } = await supabase
        .from('user_onboarding_progress')
        .select('step_id')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        return;
      }

      const completedSteps = progress?.map(p => p.step_id) || [];
      const isComplete = profile?.onboarding_complete || false;

      setState(prev => ({
        ...prev,
        completedSteps,
        isComplete,
        showWelcomeModal: !isComplete && completedSteps.length === 0
      }));

    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
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
  const completeStep = useCallback(async (stepId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const step = ONBOARDING_STEPS.find(s => s.id === stepId);
      if (!step) return;

      // Record step completion
      const { error } = await supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          step_name: step.name,
          step_data: { completed_at: new Date().toISOString() }
        });

      if (error) {
        console.error('Error recording step completion:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepId])]
      }));

    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, []);

  // Complete entire onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark onboarding as complete
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
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
  const resetOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark as incomplete
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_complete: false })
        .eq('id', user.id);

      if (error) {
        console.error('Error resetting onboarding:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        isComplete: false,
        showWelcomeModal: true
      }));

    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
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