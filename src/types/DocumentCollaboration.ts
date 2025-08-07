export interface DocumentComment {
  id: string;
  document_id: string;
  content: string;
  position_data?: any;
  thread_id?: string | null;
  resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  mentions?: DocumentMention[];
  replies?: DocumentComment[];
}

export interface DocumentMention {
  id: string;
  comment_id: string;
  mentioned_user_id: string;
  created_at: string;
  mentioned_user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface DocumentPresence {
  id: string;
  document_id: string;
  user_id: string;
  cursor_position?: any;
  selection_data?: any;
  last_seen: string;
  created_at: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface DocumentNotification {
  id: string;
  user_id: string;
  document_id?: string;
  comment_id?: string;
  notification_type: 'comment' | 'mention' | 'permission_granted' | 'document_shared';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  document?: {
    id: string;
    title: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

export interface CreateCommentData {
  document_id: string;
  content: string;
  position_data?: any;
  thread_id?: string;
  mentions?: string[];
}

export interface UpdatePresenceData {
  document_id: string;
  cursor_position?: any;
  selection_data?: any;
}