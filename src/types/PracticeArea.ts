
export interface PracticeArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePracticeAreaData {
  name: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

export interface UpdatePracticeAreaData {
  name?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}
