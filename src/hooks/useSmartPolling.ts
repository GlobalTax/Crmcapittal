import { useEffect, useState, useRef } from 'react';

interface UseSmartPollingOptions {
  baseInterval: number;
  maxInterval?: number;
  backoffMultiplier?: number;
  pauseWhenHidden?: boolean;
  pauseWhenInactive?: boolean;
  inactivityThreshold?: number;
}

export const useSmartPolling = (options: UseSmartPollingOptions) => {
  const {
    baseInterval,
    maxInterval = baseInterval * 10,
    backoffMultiplier = 1.5,
    pauseWhenHidden = true,
    pauseWhenInactive = true,
    inactivityThreshold = 300000 // 5 minutes
  } = options;

  const [currentInterval, setCurrentInterval] = useState(baseInterval);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const intervalRef = useRef<NodeJS.Timeout>();
  
  // Track user activity
  useEffect(() => {
    if (!pauseWhenInactive) return;

    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [pauseWhenInactive]);

  // Track tab visibility
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseWhenHidden]);

  // Check if user is inactive
  const isUserInactive = () => {
    if (!pauseWhenInactive) return false;
    return Date.now() - lastActivity > inactivityThreshold;
  };

  // Determine current polling state
  const shouldPause = () => {
    return (pauseWhenHidden && !isTabActive) || (pauseWhenInactive && isUserInactive());
  };

  // Get adaptive interval based on conditions
  const getAdaptiveInterval = () => {
    if (!isTabActive && pauseWhenHidden) {
      return Math.min(baseInterval * 10, maxInterval); // 10x slower when hidden
    }
    
    if (isUserInactive() && pauseWhenInactive) {
      return Math.min(baseInterval * 5, maxInterval); // 5x slower when inactive
    }
    
    return baseInterval;
  };

  // Update polling interval based on conditions
  useEffect(() => {
    const newPauseState = shouldPause();
    const newInterval = getAdaptiveInterval();
    
    setIsPaused(newPauseState);
    setCurrentInterval(newInterval);
  }, [isTabActive, lastActivity, baseInterval, maxInterval]);

  // Handle exponential backoff on errors
  const handleError = () => {
    const newInterval = Math.min(currentInterval * backoffMultiplier, maxInterval);
    setCurrentInterval(newInterval);
  };

  // Reset interval on success
  const handleSuccess = () => {
    if (currentInterval !== getAdaptiveInterval()) {
      setCurrentInterval(getAdaptiveInterval());
    }
  };

  // Get current polling configuration
  const getPollingConfig = () => {
    return {
      enabled: !isPaused,
      refetchInterval: isPaused ? false : currentInterval,
      refetchIntervalInBackground: false
    };
  };

  return {
    currentInterval,
    isPaused,
    isTabActive,
    isUserActive: !isUserInactive(),
    handleError,
    handleSuccess,
    getPollingConfig
  };
};

export default useSmartPolling;