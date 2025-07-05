interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface EventQueue {
  events: AnalyticsEvent[];
  lastFlush: number;
}

class AnalyticsService {
  private eventQueue: EventQueue = {
    events: [],
    lastFlush: Date.now()
  };

  private readonly CONFIG = {
    // Rate limiting
    MAX_EVENTS_PER_MINUTE: 60,
    MAX_EVENTS_PER_BATCH: 10,
    BATCH_FLUSH_INTERVAL: 5000, // 5 seconds
    
    // Throttling intervals by event type
    THROTTLE_INTERVALS: {
      scroll: 500,
      hover: 1000,
      click: 100,
      page_view: 2000,
      search: 300,
      filter_change: 200
    },
    
    // Sampling rates (0-1)
    SAMPLING_RATES: {
      development: 0.1, // 10% in dev
      production: 1.0   // 100% in prod
    }
  };

  private eventTimestamps: number[] = [];
  private lastEventTime: Record<string, number> = {};
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Check if we're hitting rate limits
   */
  private isRateLimited(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean up old timestamps
    this.eventTimestamps = this.eventTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    return this.eventTimestamps.length >= this.CONFIG.MAX_EVENTS_PER_MINUTE;
  }

  /**
   * Check if event should be throttled
   */
  private isThrottled(eventType: string): boolean {
    const now = Date.now();
    const lastTime = this.lastEventTime[eventType] || 0;
    const throttleInterval = this.CONFIG.THROTTLE_INTERVALS[eventType as keyof typeof this.CONFIG.THROTTLE_INTERVALS] || 0;
    
    return now - lastTime < throttleInterval;
  }

  /**
   * Check if event should be sampled
   */
  private shouldSample(): boolean {
    const rate = this.isDevelopment ? 
      this.CONFIG.SAMPLING_RATES.development : 
      this.CONFIG.SAMPLING_RATES.production;
    
    return Math.random() < rate;
  }

  /**
   * Add event to queue with validation
   */
  private queueEvent(event: string, properties?: Record<string, any>): boolean {
    // Rate limiting check
    if (this.isRateLimited()) {
      console.warn(`[Analytics] Rate limited - skipping event: ${event}`);
      return false;
    }

    // Throttling check
    if (this.isThrottled(event)) {
      console.debug(`[Analytics] Throttled - skipping event: ${event}`);
      return false;
    }

    // Sampling check
    if (!this.shouldSample()) {
      console.debug(`[Analytics] Sampled out - skipping event: ${event}`);
      return false;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        environment: this.isDevelopment ? 'development' : 'production'
      },
      timestamp: Date.now()
    };

    this.eventQueue.events.push(analyticsEvent);
    this.eventTimestamps.push(Date.now());
    this.lastEventTime[event] = Date.now();

    // Auto-flush if batch is full
    if (this.eventQueue.events.length >= this.CONFIG.MAX_EVENTS_PER_BATCH) {
      this.flushEvents();
    }

    return true;
  }

  /**
   * Flush events to PostHog
   */
  private flushEvents(): void {
    if (this.eventQueue.events.length === 0) return;

    const eventsToSend = [...this.eventQueue.events];
    this.eventQueue.events = [];
    this.eventQueue.lastFlush = Date.now();

    // Send to PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      
      eventsToSend.forEach(({ event, properties }) => {
        try {
          posthog.capture(event, properties);
        } catch (error) {
          console.error(`[Analytics] Error sending event ${event}:`, error);
        }
      });

      console.debug(`[Analytics] Flushed ${eventsToSend.length} events to PostHog`);
    } else {
      console.debug(`[Analytics] PostHog not available, would send ${eventsToSend.length} events`);
    }
  }

  /**
   * Initialize auto-flush timer
   */
  private initAutoFlush(): void {
    setInterval(() => {
      if (this.eventQueue.events.length > 0) {
        const timeSinceLastFlush = Date.now() - this.eventQueue.lastFlush;
        if (timeSinceLastFlush >= this.CONFIG.BATCH_FLUSH_INTERVAL) {
          this.flushEvents();
        }
      }
    }, this.CONFIG.BATCH_FLUSH_INTERVAL);
  }

  /**
   * Public API methods
   */
  public track(event: string, properties?: Record<string, any>): void {
    this.queueEvent(event, properties);
  }

  public trackInteraction(type: 'click' | 'hover' | 'scroll', element?: string, properties?: Record<string, any>): void {
    this.queueEvent(`interaction_${type}`, {
      element,
      ...properties
    });
  }

  public trackPageView(page: string, properties?: Record<string, any>): void {
    this.queueEvent('page_view', {
      page,
      ...properties
    });
  }

  public trackSearch(query: string, results?: number, properties?: Record<string, any>): void {
    this.queueEvent('search', {
      query,
      results,
      ...properties
    });
  }

  public trackFilter(filterType: string, value: string, properties?: Record<string, any>): void {
    this.queueEvent('filter_change', {
      filter_type: filterType,
      value,
      ...properties
    });
  }

  /**
   * Force flush all pending events
   */
  public flush(): void {
    this.flushEvents();
  }

  /**
   * Get analytics stats for monitoring
   */
  public getStats(): {
    queuedEvents: number;
    eventsPerMinute: number;
    lastFlush: number;
    rateLimited: boolean;
  } {
    return {
      queuedEvents: this.eventQueue.events.length,
      eventsPerMinute: this.eventTimestamps.length,
      lastFlush: this.eventQueue.lastFlush,
      rateLimited: this.isRateLimited()
    };
  }

  /**
   * Initialize the service
   */
  public init(): void {
    this.initAutoFlush();
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });

      window.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush();
        }
      });
    }

    console.log('[Analytics] Service initialized with rate limiting and throttling');
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Initialize on import
analyticsService.init();