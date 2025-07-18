import React, { useState } from 'react';
import { TeaserWizard } from './teaser/TeaserWizard';
import { useTeasersForTransaction } from '@/hooks/useTeasersForTransaction';
import type { Database } from '@/integrations/supabase/types';

type Teaser = Database['public']['Tables']['teasers']['Row'];

interface TransaccionTeaserBuilderProps {
  transaccion: any;
  teaser?: any;
  onClose: () => void;
  onSave: () => void;
}

export function TransaccionTeaserBuilder({ transaccion, teaser, onClose, onSave }: TransaccionTeaserBuilderProps) {
  const { createTeaser, updateTeaser } = useTeasersForTransaction(transaccion.id);

  const handleSave = async (data: Partial<Teaser>) => {
    try {
      if (teaser) {
        await updateTeaser(teaser.id, data);
      } else {
        await createTeaser({
          ...data,
          title: data.title!,
          transaction_id: transaccion.id
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving teaser:', error);
    }
  };

  return (
    <TeaserWizard
      transaccion={transaccion}
      teaser={teaser}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}