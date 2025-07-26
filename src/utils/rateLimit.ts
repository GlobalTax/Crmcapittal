// Enhanced Rate Limiting for Production
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class EnhancedRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  isAllowed(config: RateLimitConfig): boolean {
    const { identifier, maxRequests, windowMs } = config;
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false
      });
      return true;
    }

    if (entry.blocked) {
      return false;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      entry.blocked = true;
      return false;
    }

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return 0;
    
    return Math.max(0, entry.count);
  }

  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier);
    return entry?.resetTime || 0;
  }

  block(identifier: string, durationMs: number = 60000) {
    const now = Date.now();
    this.store.set(identifier, {
      count: 0,
      resetTime: now + durationMs,
      blocked: true
    });
  }

  unblock(identifier: string) {
    this.store.delete(identifier);
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new EnhancedRateLimiter();

// Rate limit configurations for different operations
export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  signup: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 signups per hour
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 2 }, // 2 reset attempts per hour
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 API calls per minute
  upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
  search: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 searches per minute
  admin: { windowMs: 60 * 1000, maxRequests: 200 }, // Higher limit for admins
};

// Helper function to get user identifier for rate limiting
export const getUserIdentifier = (user?: any, ip?: string): string => {
  if (user?.id) {
    return `user:${user.id}`;
  }
  return `ip:${ip || 'unknown'}`;
};

// React hook for rate limiting
export const useRateLimit = () => {
  const checkRateLimit = (
    operation: keyof typeof RATE_LIMITS,
    identifier: string
  ): boolean => {
    const config = RATE_LIMITS[operation];
    return rateLimiter.isAllowed({
      ...config,
      identifier: `${operation}:${identifier}`
    });
  };

  const getRemainingAttempts = (
    operation: keyof typeof RATE_LIMITS,
    identifier: string
  ): number => {
    const config = RATE_LIMITS[operation];
    const used = rateLimiter.getRemainingRequests(`${operation}:${identifier}`);
    return Math.max(0, config.maxRequests - used);
  };

  const blockUser = (
    operation: keyof typeof RATE_LIMITS,
    identifier: string,
    durationMs?: number
  ) => {
    rateLimiter.block(`${operation}:${identifier}`, durationMs);
  };

  return {
    checkRateLimit,
    getRemainingAttempts,
    blockUser
  };
};