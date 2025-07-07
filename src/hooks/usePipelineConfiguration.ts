import { useState, useEffect, useCallback } from 'react';
import { Stage } from '@/types/Pipeline';
import { useStages } from '@/hooks/useStages';
import { usePipelines } from '@/hooks/usePipelines';
import { useUserTablePreferences, PreferenceData } from '@/hooks/useUserTablePreferences';

export interface PipelineConfiguration {
  selectedPipelineId: string;
  visibleStages: string[];
  stageOrder: string[];
  customStages: Array<{
    id: string;
    name: string;
    color: string;
    order_index: number;
  }>;
}

const DEFAULT_CONFIGURATION: Partial<PipelineConfiguration> = {
  visibleStages: [],
  stageOrder: [],
  customStages: []
};

export const usePipelineConfiguration = (tableName: string = 'deals') => {
  const { pipelines, loading: pipelinesLoading } = usePipelines();
  const { preferences, loading: preferencesLoading, updatePreferences, resetToDefaults } = useUserTablePreferences(tableName);
  
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [configuration, setConfiguration] = useState<PipelineConfiguration>(DEFAULT_CONFIGURATION as PipelineConfiguration);
  
  const { stages, loading: stagesLoading, createStage, updateStage, deleteStage, reorderStages } = useStages(selectedPipelineId);

  // Get DEAL pipelines
  const dealPipelines = pipelines.filter(p => p.type === 'DEAL');

  // Initialize configuration from preferences
  useEffect(() => {
    if (!preferencesLoading && !pipelinesLoading) {
      const prefs = preferences?.column_preferences as PreferenceData;
      const savedPipelineId = prefs?.selected_pipeline_id;
      const defaultPipelineId = dealPipelines[0]?.id;
      
      const pipelineId = savedPipelineId || defaultPipelineId || '';
      setSelectedPipelineId(pipelineId);
      
      setConfiguration({
        selectedPipelineId: pipelineId,
        visibleStages: prefs?.visible_columns || [],
        stageOrder: prefs?.column_order || [],
        customStages: prefs?.custom_stages || []
      });
    }
  }, [preferences, dealPipelines, preferencesLoading, pipelinesLoading]);

  // Update stages visibility
  const updateVisibleStages = useCallback(async (visibleStageIds: string[]) => {
    const newConfig = { ...configuration, visibleStages: visibleStageIds };
    setConfiguration(newConfig);
    
    await updatePreferences({
      visible_columns: visibleStageIds,
      selected_pipeline_id: configuration.selectedPipelineId
    });
  }, [configuration, updatePreferences]);

  // Reorder stages
  const updateStageOrder = useCallback(async (newOrder: string[]) => {
    const newConfig = { ...configuration, stageOrder: newOrder };
    setConfiguration(newConfig);
    
    await updatePreferences({
      column_order: newOrder,
      selected_pipeline_id: configuration.selectedPipelineId
    });

    // Also update the stages order in database
    await reorderStages(newOrder);
  }, [configuration, updatePreferences, reorderStages]);

  // Change active pipeline
  const changePipeline = useCallback(async (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    const newConfig = { ...configuration, selectedPipelineId: pipelineId };
    setConfiguration(newConfig);
    
    await updatePreferences({
      selected_pipeline_id: pipelineId,
      visible_columns: configuration.visibleStages,
      column_order: configuration.stageOrder
    });
  }, [configuration, updatePreferences]);

  // Create custom stage
  const createCustomStage = useCallback(async (stageData: {
    name: string;
    description?: string;
    color: string;
    order_index: number;
  }) => {
    if (!selectedPipelineId) return { success: false, error: 'No hay pipeline seleccionado' };

    const result = await createStage({
      ...stageData,
      pipeline_id: selectedPipelineId,
      is_active: true
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Update configuration to include the new stage
    const updatedVisibleStages = [...configuration.visibleStages, result.data!.id];
    await updateVisibleStages(updatedVisibleStages);

    return { success: true, data: result.data };
  }, [selectedPipelineId, createStage, configuration.visibleStages, updateVisibleStages]);

  // Get visible stages in order
  const getVisibleStages = useCallback((): Stage[] => {
    if (!stages.length) return [];

    // If no visible stages are configured, show all stages
    const visibleStageIds = configuration.visibleStages.length > 0 
      ? configuration.visibleStages 
      : stages.map(s => s.id);

    // Filter and order stages
    let visibleStages = stages.filter(s => visibleStageIds.includes(s.id));

    // Apply custom order if configured
    if (configuration.stageOrder.length > 0) {
      visibleStages.sort((a, b) => {
        const aIndex = configuration.stageOrder.indexOf(a.id);
        const bIndex = configuration.stageOrder.indexOf(b.id);
        
        if (aIndex === -1 && bIndex === -1) return a.order_index - b.order_index;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
      });
    } else {
      visibleStages.sort((a, b) => a.order_index - b.order_index);
    }

    return visibleStages;
  }, [stages, configuration]);

  // Reset to default configuration
  const resetConfiguration = useCallback(async () => {
    const result = await resetToDefaults();
    if (result.success) {
      const defaultPipelineId = dealPipelines[0]?.id || '';
      setSelectedPipelineId(defaultPipelineId);
      setConfiguration({
        selectedPipelineId: defaultPipelineId,
        visibleStages: [],
        stageOrder: [],
        customStages: []
      });
    }
    return result;
  }, [resetToDefaults, dealPipelines]);

  const loading = pipelinesLoading || preferencesLoading || stagesLoading;

  return {
    configuration,
    selectedPipelineId,
    dealPipelines,
    stages,
    visibleStages: getVisibleStages(),
    loading,
    changePipeline,
    updateVisibleStages,
    updateStageOrder,
    createCustomStage,
    updateStage,
    deleteStage,
    resetConfiguration
  };
};