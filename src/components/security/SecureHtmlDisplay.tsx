import React from 'react';
import { SecureHtmlRenderer } from './SecureHtmlRenderer';
import { Shield } from 'lucide-react';

interface SecureHtmlDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
  showSecurityBadge?: boolean;
}

export const SecureHtmlDisplay: React.FC<SecureHtmlDisplayProps> = ({
  content,
  className,
  maxLength = 10000,
  showSecurityBadge = true
}) => {
  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      {showSecurityBadge && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Shield className="w-3 h-3" />
          <span>Contenido verificado y seguro</span>
        </div>
      )}
      <SecureHtmlRenderer 
        content={content}
        maxLength={maxLength}
        allowBasicFormatting={true}
      />
    </div>
  );
};