"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RuleType =
  | "coRun"
  | "slotRestriction"
  | "loadLimit"
  | "phaseWindow"
  | "patternMatch"
  | "precedenceOverride";

export interface Rule {
  id: string;
  type: RuleType;
  description: string;
  config: any; // specific settings for that rule
}

interface Priorities {
  [criteria: string]: number;
}

interface RulesStore {
  rules: Rule[];
  priorities: Priorities;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, updated: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  setPriorities: (priorities: Priorities) => void;
  reset: () => void;
}

export const useRulesStore = create<RulesStore>()(
  persist(
    (set) => ({
      rules: [],
      priorities: {},
      addRule: (rule) =>
        set((state) => ({
          rules: [...state.rules, rule],
        })),
      updateRule: (id, updated) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, ...updated } : r
          ),
        })),
      deleteRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),
      setPriorities: (priorities) => set({ priorities }),
      reset: () => set({ rules: [], priorities: {} }),
    }),
    {
      name: "rules-storage",
    }
  )
);
