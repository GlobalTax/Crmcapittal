import { ReactNode } from 'react';

interface SettingSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const SettingSection = ({ title, description, children }: SettingSectionProps) => {
  return (
    <div className="bg-neutral-0 border border-border rounded-md shadow-sm p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};