import { ReactNode } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface EntityHeaderProps {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
}

export const EntityHeader = ({ icon, title, badge }: EntityHeaderProps) => {
  return (
    <CardHeader className="pb-4 pr-16">
      <CardTitle className="flex items-center gap-3">
        {icon}
        <span className="text-lg">{title}</span>
        {badge}
      </CardTitle>
    </CardHeader>
  );
};