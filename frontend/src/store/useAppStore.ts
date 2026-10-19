import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Club } from '../types';

interface AppState {
  selectedClubId: number | null;
  clubs: Club[];

  setSelectedClubId: (id: number | null) => void;
  setClubs: (clubs: Club[]) => void;
  updateClubCash: (clubId: number, newCash: number) => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedClubId: null,
      clubs: [],

      setSelectedClubId: (id) => set({ selectedClubId: id }),

      setClubs: (clubs) => set({ clubs }),

      updateClubCash: (clubId, newCash) =>
        set((state) => ({
          clubs: state.clubs.map((club) =>
            club.id === clubId ? { ...club, cash: newCash } : club
          ),
        })),

      resetStore: () => set({ selectedClubId: null, clubs: [] }),
    }),
    {
      name: 'mercado-jogadores-storage', // Chave salva no localStorage
      partialize: (state) => ({ selectedClubId: state.selectedClubId }), // Persiste apenas o id do clube selecionado
    }
  )
);
