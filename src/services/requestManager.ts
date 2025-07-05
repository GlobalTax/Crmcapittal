import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface RequestConfig {
  key: string;
  priority: 'high' | 'medium' | 'low';
  fn: () => Promise<any>;
  cacheTtl?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class RequestManager {
  private queue: RequestConfig[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private processingQueue = false;
  private rateLimitDelay = 200; // 200ms between requests
  private maxConcurrent = 3;
  private activeRequests = 0;
  private rateLimitHits = 0;

  // Rate limiting configuration based on current usage
  private readonly intervals = {
    high: 1000,    // 1 second for critical requests
    medium: 2000,  // 2 seconds for normal requests  
    low: 5000      // 5 seconds for background requests
  };

  async request<T>(config: RequestConfig): Promise<T> {
    // Check cache first
    const cached = this.getFromCache<T>(config.key);
    if (cached) {
      console.log(`📦 Cache hit for ${config.key}`);
      return cached;
    }

    // Add to queue
    return new Promise((resolve, reject) => {
      const wrappedConfig = {
        ...config,
        fn: async () => {
          try {
            const result = await config.fn();
            // Cache successful results
            if (config.cacheTtl) {
              this.setCache(config.key, result, config.cacheTtl);
            }
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        }
      };

      this.queue.push(wrappedConfig);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processingQueue || this.queue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      // Sort by priority
      this.queue.sort((a, b) => {
        const priorities = { high: 3, medium: 2, low: 1 };
        return priorities[b.priority] - priorities[a.priority];
      });

      const config = this.queue.shift();
      if (!config) continue;

      this.executeRequest(config);
    }

    this.processingQueue = false;
  }

  private async executeRequest(config: RequestConfig) {
    this.activeRequests++;

    try {
      // Apply rate limiting delay
      const delay = this.intervals[config.priority];
      await this.sleep(delay);

      console.log(`🚀 Executing request: ${config.key} (priority: ${config.priority})`);
      await config.fn();

      // Reset rate limit counter on success
      this.rateLimitHits = 0;
      
    } catch (error: any) {
      console.error(`❌ Request failed: ${config.key}`, error);
      
      // Handle rate limiting
      if (error.status === 429 || error.message?.includes('429')) {
        this.handleRateLimit();
      }
      
      throw error;
    } finally {
      this.activeRequests--;
      
      // Continue processing queue
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.rateLimitDelay);
      }
    }
  }

  private handleRateLimit() {
    this.rateLimitHits++;
    console.warn(`⚠️ Rate limit hit #${this.rateLimitHits}`);
    
    // Exponential backoff
    this.rateLimitDelay = Math.min(this.rateLimitDelay * 1.5, 10000);
    
    // Reduce concurrent requests
    this.maxConcurrent = Math.max(1, this.maxConcurrent - 1);
    
    console.log(`🔄 Adjusted settings: delay=${this.rateLimitDelay}ms, concurrent=${this.maxConcurrent}`);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch multiple queries into a single request when possible
  async batchSupabaseQuery(queries: Array<{ table: keyof Database['public']['Tables']; query: any; key: string }>) {
    const batchKey = `batch_${queries.map(q => q.key).join('_')}`;
    
    return this.request({
      key: batchKey,
      priority: 'medium',
      cacheTtl: 60000, // 1 minute cache
      fn: async () => {
        const results = await Promise.all(
          queries.map(async ({ table, query, key }) => {
            const result = await supabase.from(table).select(query);
            return { key, result };
          })
        );
        return results;
      }
    });
  }

  // Get current stats for monitoring
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      cacheSize: this.cache.size,
      rateLimitHits: this.rateLimitHits,
      currentDelay: this.rateLimitDelay,
      maxConcurrent: this.maxConcurrent
    };
  }

  // Clear cache manually
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global singleton instance
export const requestManager = new RequestManager();

// Helper function for common Supabase queries
export const supabaseQuery = async <T>(
  table: keyof Database['public']['Tables'],
  queryBuilder: (query: any) => any,
  cacheKey: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
  cacheTtl: number = 120000 // 2 minutes default
): Promise<T> => {
  return requestManager.request<T>({
    key: cacheKey,
    priority,
    cacheTtl,
    fn: async () => {
      const query = supabase.from(table);
      const { data, error } = await queryBuilder(query);
      
      if (error) {
        console.error(`Supabase query error for ${table}:`, error);
        throw error;
      }
      
      return data;
    }
  });
};