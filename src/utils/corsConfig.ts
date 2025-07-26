// CORS Configuration for production security
export const CORS_CONFIG = {
  // Development origins
  development: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  
  // Production origins - UPDATE THESE WITH YOUR ACTUAL DOMAINS
  production: [
    'https://your-domain.com',
    'https://www.your-domain.com',
    'https://app.your-domain.com'
  ],
  
  // Staging origins
  staging: [
    'https://staging.your-domain.com'
  ]
};

export const getAllowedOrigins = (): string[] => {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return CORS_CONFIG.production;
    case 'staging':
      return CORS_CONFIG.staging;
    default:
      return CORS_CONFIG.development;
  }
};

export const isValidOrigin = (origin: string): boolean => {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

export const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Only allow specific origins, not wildcard
  const allowOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0]; // Fallback to first allowed origin
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};