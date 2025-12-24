import { create } from 'zustand';
import type { Baby } from '../types';
import { babyApi } from '../api/baby';

interface BabyState {
  babies: Baby[];
  selectedBaby: Baby | null;
  isLoading: boolean;
  fetchBabies: () => Promise<void>;
  setSelectedBaby: (baby: Baby | null) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (baby: Baby) => void;
  removeBaby: (babyId: string) => void;
}

export const useBabyStore = create<BabyState>((set) => ({
  babies: [],
  selectedBaby: null,
  isLoading: false,

  fetchBabies: async () => {
    set({ isLoading: true });
    try {
      const babies = await babyApi.getAll();
      set({ babies, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch babies:', error);
      set({ isLoading: false });
    }
  },

  setSelectedBaby: (baby: Baby | null) => {
    set({ selectedBaby: baby });
  },

  addBaby: (baby: Baby) => {
    set((state) => ({ babies: [...state.babies, baby] }));
  },

  updateBaby: (baby: Baby) => {
    set((state) => ({
      babies: state.babies.map((b) => (b.id === baby.id ? baby : b)),
    }));
  },

  removeBaby: (babyId: string) => {
    set((state) => ({
      babies: state.babies.filter((b) => b.id !== babyId),
      selectedBaby:
        state.selectedBaby?.id === babyId ? null : state.selectedBaby,
    }));
  },
}));






