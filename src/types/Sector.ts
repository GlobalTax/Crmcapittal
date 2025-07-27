
// New type for sectors
export interface Sector {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSectorData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateSectorData extends Partial<CreateSectorData> {}
