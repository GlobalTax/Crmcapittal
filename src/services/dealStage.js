/**
 * Deal Stage Service
 * 
 * Provides functions to manage M&A pipeline stages, probabilities and stage progression
 */

import maPipelineData from '../pipelines/maPipeline.json';

// Cache en memoria para evitar lecturas repetidas
let pipelineCache = null;

/**
 * Obtiene el pipeline desde cache o lo carga
 * @returns {Object} Pipeline data
 */
const getPipeline = () => {
  if (!pipelineCache) {
    pipelineCache = maPipelineData;
  }
  return pipelineCache;
};

/**
 * Obtiene la probabilidad de un stage específico
 * @param {string} stage - Nombre del stage
 * @returns {number} Probabilidad en porcentaje (0-100)
 */
export const getProbability = (stage) => {
  if (!stage || typeof stage !== 'string') {
    return 0;
  }

  const pipeline = getPipeline();
  const stageData = pipeline.stages.find(s => s.name === stage);
  
  return stageData ? stageData.probabilityPct : 0;
};

/**
 * Obtiene el siguiente stage en el pipeline
 * @param {string} currentStage - Stage actual
 * @returns {string|null} Siguiente stage o null si es el último o stage inválido
 */
export const getNextStage = (currentStage) => {
  if (!currentStage || typeof currentStage !== 'string') {
    return null;
  }

  const pipeline = getPipeline();
  const currentStageData = pipeline.stages.find(s => s.name === currentStage);
  
  if (!currentStageData) {
    return null;
  }

  // Si es "Closed Lost", no hay siguiente stage
  if (currentStage === 'Closed Lost') {
    return null;
  }

  // Si es "Mandate Signed", no hay siguiente stage en este pipeline
  if (currentStage === 'Mandate Signed') {
    return null;
  }

  // Buscar el siguiente stage por orden
  const nextOrder = currentStageData.order + 1;
  const nextStageData = pipeline.stages.find(s => s.order === nextOrder && s.isActive);
  
  return nextStageData ? nextStageData.name : null;
};

/**
 * Obtiene el stage anterior en el pipeline
 * @param {string} currentStage - Stage actual
 * @returns {string|null} Stage anterior o null si es el primero o stage inválido
 */
export const getPreviousStage = (currentStage) => {
  if (!currentStage || typeof currentStage !== 'string') {
    return null;
  }

  const pipeline = getPipeline();
  const currentStageData = pipeline.stages.find(s => s.name === currentStage);
  
  if (!currentStageData || currentStageData.order === 1) {
    return null;
  }

  // Buscar el stage anterior por orden
  const previousOrder = currentStageData.order - 1;
  const previousStageData = pipeline.stages.find(s => s.order === previousOrder && s.isActive);
  
  return previousStageData ? previousStageData.name : null;
};

/**
 * Obtiene todos los stages activos del pipeline
 * @returns {Array} Array de objetos stage
 */
export const getAllStages = () => {
  const pipeline = getPipeline();
  return pipeline.stages
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order);
};

/**
 * Obtiene información completa de un stage
 * @param {string} stageName - Nombre del stage
 * @returns {Object|null} Datos completos del stage o null si no existe
 */
export const getStageInfo = (stageName) => {
  if (!stageName || typeof stageName !== 'string') {
    return null;
  }

  const pipeline = getPipeline();
  return pipeline.stages.find(s => s.name === stageName) || null;
};

/**
 * Valida si un stage es válido
 * @param {string} stage - Nombre del stage
 * @returns {boolean} True si el stage es válido
 */
export const isValidStage = (stage) => {
  if (!stage || typeof stage !== 'string') {
    return false;
  }

  const pipeline = getPipeline();
  return pipeline.stages.some(s => s.name === stage && s.isActive);
};

/**
 * Obtiene el stage por defecto del pipeline
 * @returns {string} Nombre del stage por defecto
 */
export const getDefaultStage = () => {
  const pipeline = getPipeline();
  return pipeline.metadata.defaultStage || 'New Lead';
};

/**
 * Verifica si un stage es final (no tiene siguiente)
 * @param {string} stage - Nombre del stage
 * @returns {boolean} True si es un stage final
 */
export const isFinalStage = (stage) => {
  if (!stage || typeof stage !== 'string') {
    return false;
  }

  const pipeline = getPipeline();
  return pipeline.metadata.finalStages.includes(stage);
};

/**
 * Recarga el cache del pipeline (útil para tests o actualizaciones)
 */
export const reloadPipeline = () => {
  pipelineCache = null;
  return getPipeline();
};