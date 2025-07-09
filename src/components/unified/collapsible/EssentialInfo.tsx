import { ReactNode } from 'react';

interface EssentialInfoProps {
  children: ReactNode;
}

export const EssentialInfo = ({ children }: EssentialInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  );
};

interface EssentialFieldProps {
  icon?: ReactNode;
  label?: string;
  value?: string | ReactNode;
  href?: string;
  className?: string;
}

export const EssentialField = ({ icon, label, value, href, className = "" }: EssentialFieldProps) => {
  const content = (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {icon}
      {label && <span className="text-muted-foreground">{label}:</span>}
      <span className={href ? "text-blue-600 hover:underline" : "font-medium"}>
        {value}
      </span>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }

  return content;
};