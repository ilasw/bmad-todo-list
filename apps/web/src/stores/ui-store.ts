import { create } from 'zustand'

interface UiState {
  draftDescription: string
  setDraftDescription: (value: string) => void
  clearDraftDescription: () => void
}

export const useUiStore = create<UiState>((set) => ({
  draftDescription: '',
  setDraftDescription: (value) => set({ draftDescription: value }),
  clearDraftDescription: () => set({ draftDescription: '' }),
}))
