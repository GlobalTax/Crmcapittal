export interface ReconversionNotificationData {
  type: 'reconversion_created' | 'candidate_added' | 'reconversion_closed' | 'data_missing';
  reconversionId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  recipientUserId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}