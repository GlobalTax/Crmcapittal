
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';

interface TimelineStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const TimelineStep: React.FC<TimelineStepProps> = ({ data, onChange, errors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Cronograma del Proyecto</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Timeline Avanzado</h3>
          <p className="text-sm">Funcionalidad en desarrollo</p>
        </div>
      </CardContent>
    </Card>
  );
};
