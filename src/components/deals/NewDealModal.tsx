import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { CreateDealData, DealStage } from '@/types/Deal';
import { useDeals } from '@/hooks/useDeals';

interface NewDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStage?: DealStage;
}

const STAGES: DealStage[] = ['Lead', 'In Progress', 'Won', 'Lost'];

export const NewDealModal = ({ open, onOpenChange, defaultStage = 'Lead' }: NewDealModalProps) => {
  const { createDeal } = useDeals();
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<CreateDealData>({
    defaultValues: {
      stage: defaultStage,
      probability: 25
    }
  });

  const selectedStage = watch('stage');

  React.useEffect(() => {
    if (open) {
      setValue('stage', defaultStage);
      // Set probability based on stage
      const probabilityMap: Record<DealStage, number> = {
        'Lead': 25,
        'In Progress': 50,
        'Won': 100,
        'Lost': 0
      };
      setValue('probability', probabilityMap[defaultStage]);
    }
  }, [open, defaultStage, setValue]);

  const onSubmit = async (data: CreateDealData) => {
    const result = await createDeal(data);
    if (result.error === null) {
      reset();
      onOpenChange(false);
    }
  };

  const handleStageChange = (stage: DealStage) => {
    setValue('stage', stage);
    const probabilityMap: Record<DealStage, number> = {
      'Lead': 25,
      'In Progress': 50,
      'Won': 100,
      'Lost': 0
    };
    setValue('probability', probabilityMap[stage]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="Enter deal title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="Deal value in EUR"
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select value={selectedStage} onValueChange={handleStageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="probability">Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              {...register('probability', { valueAsNumber: true })}
              min="0"
              max="100"
              step="5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};