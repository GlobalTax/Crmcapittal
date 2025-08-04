import { UnifiedActivity } from '@/types/UnifiedActivity';
import { LeadInteraction } from '@/types/LeadInteraction';

// Icon mapping based on activity type and subtype
export const getActivityIcon = (activityType: string, subtype?: string): string => {
  // Lead interactions
  if (activityType === 'lead_interaction') {
    switch (subtype) {
      case 'email': return '✉️';
      case 'llamada': return '📞';
      case 'reunion': return '👥';
      case 'nota': return '📝';
      case 'task': return '✅';
      default: return '💬';
    }
  }

  // Mandate activities
  if (activityType === 'mandate_activity') {
    switch (subtype) {
      case 'target_created': return '🏢';
      case 'target_contacted': return '📞';
      case 'status_changed': return '🔄';
      case 'document_uploaded': return '📄';
      case 'comment_added': return '📝';
      case 'nda_generated': return '🔒';
      case 'meeting_scheduled': return '📅';
      default: return '🎯';
    }
  }

  // Reconversion audit logs
  if (activityType === 'reconversion_audit') {
    switch (subtype) {
      case 'created': return '🆕';
      case 'updated': return '✏️';
      case 'status_change': return '🔄';
      case 'assigned': return '👤';
      case 'candidate_added': return '➕';
      case 'candidate_contact_updated': return '📝';
      case 'paused': return '⏸️';
      case 'closed': return '❌';
      default: return '📊';
    }
  }

  // Valoracion security logs
  if (activityType === 'valoracion_security') {
    switch (subtype) {
      case 'access_granted': return '🔓';
      case 'token_generated': return '🔑';
      case 'unauthorized_attempt': return '🚫';
      case 'document_review': return '📄';
      case 'status_change': return '🔄';
      case 'comment_added': return '💬';
      default: return '🔒';
    }
  }

  return '📋';
};

export const getActivityColor = (activityType: string, subtype?: string): string => {
  // Lead interactions
  if (activityType === 'lead_interaction') {
    switch (subtype) {
      case 'email': return 'hsl(213, 94%, 68%)';
      case 'llamada': return 'hsl(30, 100%, 50%)';
      case 'reunion': return 'hsl(280, 100%, 70%)';
      case 'nota': return 'hsl(158, 100%, 38%)';
      case 'task': return 'hsl(42, 100%, 50%)';
      default: return 'hsl(213, 94%, 68%)';
    }
  }

  // Mandate activities
  if (activityType === 'mandate_activity') {
    switch (subtype) {
      case 'target_created': return 'hsl(158, 100%, 38%)';
      case 'target_contacted': return 'hsl(30, 100%, 50%)';
      case 'status_changed': return 'hsl(42, 100%, 50%)';
      case 'document_uploaded': return 'hsl(280, 100%, 70%)';
      case 'comment_added': return 'hsl(213, 94%, 68%)';
      default: return 'hsl(213, 94%, 68%)';
    }
  }

  // Reconversion audit logs
  if (activityType === 'reconversion_audit') {
    switch (subtype) {
      case 'created': return 'hsl(158, 100%, 38%)';
      case 'updated': return 'hsl(42, 100%, 50%)';
      case 'status_change': return 'hsl(213, 94%, 68%)';
      case 'paused': return 'hsl(30, 100%, 50%)';
      case 'closed': return 'hsl(0, 100%, 50%)';
      default: return 'hsl(213, 94%, 68%)';
    }
  }

  // Valoracion security logs
  if (activityType === 'valoracion_security') {
    switch (subtype) {
      case 'access_granted': return 'hsl(158, 100%, 38%)';
      case 'unauthorized_attempt': return 'hsl(0, 100%, 50%)';
      case 'token_generated': return 'hsl(42, 100%, 50%)';
      default: return 'hsl(280, 100%, 70%)';
    }
  }

  return 'hsl(213, 94%, 68%)';
};

// Transform lead interactions to unified format
export const transformLeadInteractions = (interactions: LeadInteraction[], leadId: string): UnifiedActivity[] => {
  return interactions.map(interaction => ({
    id: interaction.id,
    type: 'lead_interaction' as const,
    title: `${interaction.tipo.charAt(0).toUpperCase()}${interaction.tipo.slice(1)}`,
    description: interaction.detalle || `Interacción de tipo ${interaction.tipo}`,
    icon: getActivityIcon('lead_interaction', interaction.tipo),
    timestamp: interaction.fecha,
    user_name: interaction.user_id ? 'Usuario' : 'Sistema',
    user_email: undefined,
    entity_id: leadId,
    severity: 'medium',
    metadata: {
      interaction_type: interaction.tipo,
      original_data: interaction
    },
    source_table: 'lead_interactions',
    activity_subtype: interaction.tipo
  }));
};

// Transform mandate activities to unified format (using mock data structure from existing components)
export const transformMandateActivities = (activities: any[], mandateId: string): UnifiedActivity[] => {
  return activities.map(activity => ({
    id: activity.id,
    type: 'mandate_activity' as const,
    title: activity.title,
    description: activity.description,
    icon: getActivityIcon('mandate_activity', activity.type),
    timestamp: activity.timestamp,
    user_name: activity.user,
    user_email: undefined,
    entity_id: mandateId,
    severity: 'medium',
    metadata: {
      ...activity.details,
      original_data: activity
    },
    source_table: 'mandate_target_activities',
    activity_subtype: activity.type
  }));
};

// Transform reconversion audit logs to unified format
export const transformReconversionLogs = (logs: any[], reconversionId: string): UnifiedActivity[] => {
  return logs.map(log => ({
    id: log.id,
    type: 'reconversion_audit' as const,
    title: log.action_title || log.action_type,
    description: log.action_description || `Acción de reconversión: ${log.action_type}`,
    icon: getActivityIcon('reconversion_audit', log.action_type),
    timestamp: log.created_at,
    user_name: 'Sistema',
    user_email: undefined,
    entity_id: reconversionId,
    severity: getSeverityFromActionType(log.action_type),
    metadata: {
      action_type: log.action_type,
      previous_value: log.previous_value,
      new_value: log.new_value,
      ...log.metadata,
      original_data: log
    },
    source_table: 'reconversion_audit_logs',
    activity_subtype: log.action_type
  }));
};

// Transform valoracion security logs to unified format
export const transformValoracionLogs = (logs: any[], valoracionId: string): UnifiedActivity[] => {
  return logs.map(log => ({
    id: log.id,
    type: 'valoracion_security' as const,
    title: log.event_type || 'Evento de seguridad',
    description: log.description || `Evento de valoración: ${log.event_type}`,
    icon: getActivityIcon('valoracion_security', log.event_type),
    timestamp: log.created_at,
    user_name: log.user_email?.split('@')[0] || 'Sistema',
    user_email: log.user_email,
    entity_id: valoracionId,
    severity: log.severity || 'medium',
    metadata: {
      event_type: log.event_type,
      ...log.metadata,
      original_data: log
    },
    source_table: 'valoracion_security_logs',
    activity_subtype: log.event_type
  }));
};

// Helper function to determine severity from action type
const getSeverityFromActionType = (actionType: string): 'low' | 'medium' | 'high' | 'critical' => {
  const highSeverityActions = ['deleted', 'closed', 'cancelled'];
  const criticalSeverityActions = ['unauthorized_access', 'security_breach'];
  const lowSeverityActions = ['created', 'viewed', 'assigned'];

  if (criticalSeverityActions.includes(actionType)) return 'critical';
  if (highSeverityActions.includes(actionType)) return 'high';
  if (lowSeverityActions.includes(actionType)) return 'low';
  return 'medium';
};