
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';

interface TermsStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const TermsStep: React.FC<TermsStepProps> = ({ data, onChange, errors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Términos y Condiciones</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="terms">Términos y Condiciones</Label>
          <Textarea
            id="terms"
            value={data.terms_and_conditions || ''}
            onChange={(e) => onChange({ terms_and_conditions: e.target.value })}
            placeholder="Términos y condiciones específicos de esta propuesta..."
            rows={8}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notas Internas</Label>
          <Textarea
            id="notes"
            value={data.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Notas internas (no visibles para el cliente)"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
