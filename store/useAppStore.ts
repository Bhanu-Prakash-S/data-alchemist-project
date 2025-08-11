import { create } from "zustand";

export type EntityType = "Clients" | "Workers" | "Tasks";

interface AppState {
  activeEntity: EntityType;
  clients: any[];
  workers: any[];
  tasks: any[];
  setActiveEntity: (entity: EntityType) => void;
  setData: (entity: EntityType, data: any[]) => void;
  loadFromLocalStorage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeEntity: "Clients",
  clients: [],
  workers: [],
  tasks: [],
  setActiveEntity: (entity) => set({ activeEntity: entity }),
  setData: (entity, data) => {
    set({ [entity.toLowerCase()]: data } as any);
    localStorage.setItem(entity, JSON.stringify(data));
  },
  loadFromLocalStorage: () => {
    const clients = JSON.parse(localStorage.getItem("Clients") || "[]");
    const workers = JSON.parse(localStorage.getItem("Workers") || "[]");
    const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
    set({ clients, workers, tasks });
  },
}));
