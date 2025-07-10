import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { CreateDealData, DealStage } from '@/types/Deal';
import { useDeals } from '@/hooks/useDeals';
import { useUsers } from '@/hooks/useUsers';
import { useCompanies } from '@/hooks/useCompanies';
import { useContacts } from '@/hooks/useContacts';

interface NewDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStage?: DealStage;
  defaultCompanyId?: string;
}

const STAGES: DealStage[] = ['Lead', 'In Progress', 'Won', 'Lost'];

// Validation schema
const dealSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  stage: z.enum(['Lead', 'In Progress', 'Won', 'Lost']),
  ownerId: z.string().min(1, 'Owner is required'),
  amount: z.number().positive().optional(),
  companyId: z.string().optional(),
  associatedPeople: z.array(z.string()).optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

export const NewDealModal = ({ open, onOpenChange, defaultStage = 'Lead', defaultCompanyId }: NewDealModalProps) => {
  const { createDeal } = useDeals();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { companies, isLoading: isLoadingCompanies } = useCompanies({ limit: 100 });
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const [createMore, setCreateMore] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      stage: defaultStage,
      title: '',
      ownerId: '',
      amount: undefined,
      companyId: '',
      associatedPeople: [],
    }
  });

  const selectedStage = watch('stage');

  // Set initial focus and keyboard shortcuts
  useEffect(() => {
    if (open) {
      setValue('stage', defaultStage);
      if (defaultCompanyId) {
        setValue('companyId', defaultCompanyId);
      }
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, defaultStage, defaultCompanyId, setValue, handleSubmit]);

  const onSubmit = async (data: DealFormData) => {
    const result = await createDeal({
      title: data.title,
      stage: data.stage,
      ownerId: data.ownerId,
      amount: data.amount,
      companyId: data.companyId,
      associatedPeople: data.associatedPeople,
      probability: getProbabilityByStage(data.stage),
    });
    
    if (result.error === null) {
      if (createMore) {
        reset({
          stage: defaultStage,
          title: '',
          ownerId: '',
          amount: undefined,
          companyId: '',
          associatedPeople: [],
        });
      } else {
        reset();
        onOpenChange(false);
      }
    }
  };

  const getProbabilityByStage = (stage: DealStage): number => {
    const probabilityMap: Record<DealStage, number> = {
      'Lead': 25,
      'In Progress': 50,
      'Won': 100,
      'Lost': 0
    };
    return probabilityMap[stage];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-neutral-0 p-0 gap-0">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex-1">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="templates" 
                  disabled
                  className="text-sm font-medium text-neutral-400 px-4 pb-2"
                >
                  Create templates
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center w-6 h-6 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-8 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Stage - Required */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Stage *
              </Label>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger 
                      className="w-full"
                      aria-required="true"
                      autoFocus
                    >
                      <SelectValue placeholder="Select stage" className="text-neutral-400" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stage && (
                <p className="text-xs text-red-500">{errors.stage.message}</p>
              )}
            </div>

            {/* Owner - Required */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Owner *
              </Label>
              <Controller
                name="ownerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-required="true">
                      <SelectValue placeholder="Select owner" className="text-neutral-400" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ownerId && (
                <p className="text-xs text-red-500">{errors.ownerId.message}</p>
              )}
            </div>

            {/* Deal Title */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Deal title
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter deal title"
                    className="w-full placeholder:text-neutral-400"
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Value
              </Label>
              <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      €
                    </span>
                    <Input
                      {...field}
                      type="number"
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      className="w-full pl-8 placeholder:text-neutral-400"
                      min="0"
                      step="1000"
                    />
                  </div>
                )}
              />
            </div>

            {/* Associated Company */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Associated company
              </Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company" className="text-neutral-400" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Associated People */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Associated people
              </Label>
              <Controller
                name="associatedPeople"
                control={control}
                render={({ field }) => (
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select people" className="text-neutral-400" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} {contact.email && `(${contact.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
                <Label htmlFor="create-more" className="text-sm text-neutral-600">
                  Create more
                </Label>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-neutral-0"
              >
                {isSubmitting ? 'Creating...' : 'Create record'} 
                <span className="ml-2 text-xs opacity-70">⌃ ↩</span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};