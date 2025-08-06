import { useEffect } from 'react';

interface SecurityHeadersProps {
  children: React.ReactNode;
}

/**
 * Component to add security headers and CSP meta tags
 */
export const SecurityHeaders = ({ children }: SecurityHeadersProps) => {
  useEffect(() => {
    // Add Content Security Policy meta tag if not already present
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!existingCSP) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://nbvvdaprcecaqvvkqcto.supabase.co wss://nbvvdaprcecaqvvkqcto.supabase.co",
        
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '));
      
      document.head.appendChild(cspMeta);
    }

    // Add other security headers via meta tags
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-TileColor', content: '#000000' },
      { name: 'theme-color', content: '#000000' }
    ];

    securityMetas.forEach(({ name, content }) => {
      const existingMeta = document.querySelector(`meta[name="${name}"]`);
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Add X-Frame-Options equivalent
    const frameOptions = document.createElement('meta');
    frameOptions.setAttribute('http-equiv', 'X-Frame-Options');
    frameOptions.setAttribute('content', 'DENY');
    
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      document.head.appendChild(frameOptions);
    }

  }, []);

  return <>{children}</>;
};