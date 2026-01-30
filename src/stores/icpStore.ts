import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ICPCriteria, ProspectScore, DEFAULT_CRITERIA } from '@/types/icp';

interface ICPStore {
  criteria: ICPCriteria[];
  prospects: ProspectScore[];
  setCriteria: (criteria: ICPCriteria[]) => void;
  updateCriteriaWeight: (id: string, weight: number) => void;
  addProspect: (prospect: ProspectScore) => void;
  removeProspect: (id: string) => void;
  clearProspects: () => void;
}

export const useICPStore = create<ICPStore>()(
  persist(
    (set) => ({
      criteria: DEFAULT_CRITERIA,
      prospects: [],
      setCriteria: (criteria) => set({ criteria }),
      updateCriteriaWeight: (id, weight) =>
        set((state) => ({
          criteria: state.criteria.map((c) =>
            c.id === id ? { ...c, weight } : c
          ),
        })),
      addProspect: (prospect) =>
        set((state) => ({
          prospects: [prospect, ...state.prospects],
        })),
      removeProspect: (id) =>
        set((state) => ({
          prospects: state.prospects.filter((p) => p.id !== id),
        })),
      clearProspects: () => set({ prospects: [] }),
    }),
    {
      name: 'fitcheck-storage',
    }
  )
);
