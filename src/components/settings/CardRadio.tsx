
import { ReactNode } from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CardRadioProps {
  value: string;
  label: string;
  description: string;
  icon: ReactNode;
  badge?: string;
  checked: boolean;
}

export const CardRadio = ({ value, label, description, icon, badge, checked }: CardRadioProps) => {
  return (
    <div className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
      checked ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
    }`}>
      <Label htmlFor={value} className="cursor-pointer">
        <div className="flex items-start gap-3">
          <RadioGroupItem value={value} id={value} className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium">{label}</span>
              {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </Label>
    </div>
  );
};
