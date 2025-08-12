// /store/useRulesStore.ts
import { create } from "zustand";
import { Rule, RuleType } from "@/types/rules";
import { nanoid } from "nanoid";

interface RulesState {
  rules: Rule[];
  addRule: (type: RuleType) => void;
  updateRule: (id: string, changes: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
}

export const useRulesStore = create<RulesState>((set) => ({
  rules: [],
  addRule: (type) =>
    set((state) => ({
      rules: [...state.rules, { id: nanoid(), type }],
    })),
  updateRule: (id, changes) =>
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    })),
  deleteRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),
}));
