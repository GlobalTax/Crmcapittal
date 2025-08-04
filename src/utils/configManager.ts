import { secureLogger } from './secureLogger';

interface AppConfig {
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  
  // API Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Performance Settings
  queryStaleTime: number;
  queryGcTime: number;
  maxRetryAttempts: number;
  
  // UI Settings
  defaultPageSize: number;
  maxLogEntries: number;
  
  // Features
  features: {
    enableAnalytics: boolean;
    enableLogging: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
  };
  
  // Timeouts
  timeouts: {
    api: number;
    upload: number;
    download: number;
  };
}

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  private loadConfiguration(): AppConfig {
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;

    return {
      // Environment
      isDevelopment,
      isProduction,
      
      // API Configuration - using Vite's built-in env handling
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      
      // Performance Settings
      queryStaleTime: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 min dev, 5 min prod
      queryGcTime: isDevelopment ? 2 * 60 * 1000 : 10 * 60 * 1000, // 2 min dev, 10 min prod
      maxRetryAttempts: isDevelopment ? 1 : 2,
      
      // UI Settings
      defaultPageSize: 12,
      maxLogEntries: isDevelopment ? 500 : 100,
      
      // Features
      features: {
        enableAnalytics: isProduction,
        enableLogging: true,
        enableErrorReporting: isProduction,
        enablePerformanceMonitoring: isProduction,
      },
      
      // Timeouts (in milliseconds)
      timeouts: {
        api: 30000, // 30 seconds
        upload: 300000, // 5 minutes
        download: 120000, // 2 minutes
      }
    };
  }

  private validateConfiguration(): void {
    const errors: string[] = [];

    if (!this.config.supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required');
    }

    if (!this.config.supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required');
    }

    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed: ${errors.join(', ')}`;
      secureLogger.error('Configuration validation failed', { errors });
      throw new Error(errorMessage);
    }

    secureLogger.info('Configuration loaded and validated successfully', {
      environment: this.config.isDevelopment ? 'development' : 'production',
      features: Object.keys(this.config.features).filter(key => 
        this.config.features[key as keyof typeof this.config.features]
      )
    });
  }

  // Getters for configuration sections
  get environment() {
    return {
      isDevelopment: this.config.isDevelopment,
      isProduction: this.config.isProduction,
    };
  }

  get api() {
    return {
      supabaseUrl: this.config.supabaseUrl,
      supabaseAnonKey: this.config.supabaseAnonKey,
    };
  }

  get performance() {
    return {
      queryStaleTime: this.config.queryStaleTime,
      queryGcTime: this.config.queryGcTime,
      maxRetryAttempts: this.config.maxRetryAttempts,
    };
  }

  get ui() {
    return {
      defaultPageSize: this.config.defaultPageSize,
      maxLogEntries: this.config.maxLogEntries,
    };
  }

  get features() {
    return { ...this.config.features };
  }

  get timeouts() {
    return { ...this.config.timeouts };
  }

  // Feature flags
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Get full configuration (for debugging - sanitized)
  getConfiguration() {
    return {
      ...this.config,
      supabaseAnonKey: this.config.supabaseAnonKey ? '[REDACTED]' : 'missing',
    };
  }

  // Update feature flag at runtime (for A/B testing, etc.)
  updateFeature(feature: keyof AppConfig['features'], enabled: boolean): void {
    this.config.features[feature] = enabled;
    secureLogger.info(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

// Convenience exports
export const config = configManager;
export const isFeatureEnabled = (feature: keyof AppConfig['features']) => 
  configManager.isFeatureEnabled(feature);