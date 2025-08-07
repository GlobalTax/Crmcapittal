export interface DocumentFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  folder_type: 'client' | 'project' | 'general' | 'template';
  client_id: string | null;
  project_id: string | null;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  title: string;
  content: any;
  changes_summary: string | null;
  created_by: string;
  created_at: string;
}

export interface FolderTreeItem extends DocumentFolder {
  children: FolderTreeItem[];
  depth: number;
}