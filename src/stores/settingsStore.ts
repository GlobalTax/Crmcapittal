import { create } from 'zustand';

interface SettingsState {
  selectedItem: string;
  filter: string;
  settings: Record<string, any>;
  setSelectedItem: (item: string) => void;
  setFilter: (filter: string) => void;
  updateSetting: (key: string, value: any) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  selectedItem: 'profile',
  filter: '',
  settings: {},
  setSelectedItem: (item) => set({ selectedItem: item }),
  setFilter: (filter) => set({ filter }),
  updateSetting: (key, value) => set((state) => ({
    settings: { ...state.settings, [key]: value }
  })),
}));