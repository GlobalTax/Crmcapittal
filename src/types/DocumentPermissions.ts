export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id?: string;
  team_id?: string;
  permission_type: 'owner' | 'editor' | 'viewer' | 'commenter';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  share_token: string;
  password_hash?: string;
  max_views?: number;
  current_views: number;
  expires_at?: string;
  watermark_enabled: boolean;
  download_allowed: boolean;
  print_allowed: boolean;
  share_type: 'view' | 'comment' | 'edit';
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  share_id?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  access_type: 'view' | 'download' | 'print' | 'edit';
  session_duration?: number;
  metadata: Record<string, any>;
  accessed_at: string;
}

export interface ShareLinkConfig {
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  shareType: 'view' | 'comment' | 'edit';
  watermarkEnabled: boolean;
  downloadAllowed: boolean;
  printAllowed: boolean;
}

export interface PermissionAssignment {
  userId?: string;
  teamId?: string;
  permissionType: 'owner' | 'editor' | 'viewer' | 'commenter';
  expiresAt?: Date;
}