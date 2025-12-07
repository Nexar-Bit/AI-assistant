import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workshop } from "../types/workshop.types";

export type WorkshopRole = "owner" | "admin" | "technician" | "member" | "viewer";

interface WorkshopState {
  currentWorkshop: Workshop | null;
  workshops: Workshop[];
  currentWorkshopRole: WorkshopRole | null; // User's role in current workshop
  setCurrentWorkshop: (workshop: Workshop | null) => void;
  setWorkshops: (workshops: Workshop[]) => void;
  setCurrentWorkshopRole: (role: WorkshopRole | null) => void;
}

const STORAGE_KEY = "workshop-storage";

export const useWorkshopStore = create<WorkshopState>()(
  persist(
    (set) => ({
      currentWorkshop: null,
      workshops: [],
      currentWorkshopRole: null,
      setCurrentWorkshop: (workshop) => set({ currentWorkshop: workshop }),
      setWorkshops: (workshops) => set({ workshops }),
      setCurrentWorkshopRole: (role) => set({ currentWorkshopRole: role }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currentWorkshop: state.currentWorkshop,
        workshops: state.workshops,
      }),
    },
  ),
);

