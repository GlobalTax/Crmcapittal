
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';

interface VisualStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const VisualStep: React.FC<VisualStepProps> = ({ data, onChange, errors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Personalización Visual</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Editor Visual</h3>
          <p className="text-sm">Personalización avanzada próximamente</p>
        </div>
      </CardContent>
    </Card>
  );
};
