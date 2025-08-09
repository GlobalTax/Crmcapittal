import { create } from 'zustand';

interface UiLayoutState {
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}

export const useUiLayout = create<UiLayoutState>((set) => ({
  focusMode: false,
  setFocusMode: (v) => set({ focusMode: v }),
}));
