// /store/useAppStore.ts
import { create } from "zustand";
import { runAllValidators, ValidationIssue } from "@/lib/validationEngine";
import { EntityType } from "@/lib/validationEngine";
export type AppView = EntityType | "Validation Issues" | "Business Rules";

interface AppState {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  activeEntity: EntityType;
  clients: any[];
  workers: any[];
  tasks: any[];
  validationIssues: ValidationIssue[];
  validationPanelOpen: boolean;

  setActiveEntity: (e: EntityType) => void;
  setData: (entity: EntityType, rows: any[]) => void;
  loadFromLocalStorage: () => void;
  runAllValidators: () => void;
  clearValidation: () => void;
  toggleValidationPanel: (open?: boolean) => void;
  applyQuickFix: (issueId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeView: "Clients",
  setActiveView: (view) => set({ activeView: view }),
  activeEntity: "Clients",
  clients: [],
  workers: [],
  tasks: [],
  validationIssues: [],
  validationPanelOpen: false,

  setActiveEntity: (entity) => set({ activeEntity: entity }),
  setData: (entity, rows) => {
    // set and persist
    const key = entity;
    set((state: any) => ({ ...state, [entity.toLowerCase()]: rows }));
    try {
      localStorage.setItem(key, JSON.stringify(rows));
    } catch {}
  },

  loadFromLocalStorage: () => {
    try {
      const clients = JSON.parse(localStorage.getItem("Clients") || "[]");
      const workers = JSON.parse(localStorage.getItem("Workers") || "[]");
      const tasks = JSON.parse(localStorage.getItem("Tasks") || "[]");
      set({ clients, workers, tasks });
    } catch {
      set({ clients: [], workers: [], tasks: [] });
    }
  },

  runAllValidators: () => {
    const state = get();
    const data = {
      Clients: state.clients,
      Workers: state.workers,
      Tasks: state.tasks,
    };
    const issues = runAllValidators(data);
    set({ validationIssues: issues });
    return issues;
  },

  clearValidation: () => set({ validationIssues: [] }),

  toggleValidationPanel: (open) => {
    set((s) => ({
      validationPanelOpen: open === undefined ? !s.validationPanelOpen : open,
    }));
  },

  applyQuickFix: (issueId) => {
    const state = get();
    const issue = state.validationIssues.find((i) => i.id === issueId);
    if (!issue) return;
    // simple quick fixes implementation for a few codes
    const entity = issue.entity;
    const rowsKey = entity.toLowerCase() as "clients" | "workers" | "tasks";
    const rows = [...(state as any)[rowsKey]];

    // Helper to persist and re-run validation
    const persist = (newRows: any[]) => {
      set({ [rowsKey]: newRows } as any);
      try {
        localStorage.setItem(entity, JSON.stringify(newRows));
      } catch {}
      // re-run validators
      const issues = runAllValidators({
        Clients: state.clients,
        Workers: state.workers,
        Tasks: state.tasks,
      });
      set({ validationIssues: issues });
    };

    // Quick fix cases
    if (issue.code === "MISSING_COLUMN") {
      const col = issue.payload?.missingColumn;
      const newRows = rows.map((r) => ({ ...r, [col]: "" }));
      persist(newRows);
      return;
    }

    if (issue.code === "DUPLICATE_ID") {
      const idField = issue.payload?.idField;
      const dup = issue.payload?.duplicateFor;
      // generate unique suffix for duplicates
      const ids = rows.map((r) => r[idField]);
      const seen = new Set<string>();
      const newRows = rows.map((r, idx) => {
        let id = String(r[idField] ?? `row_${idx}`);
        if (!seen.has(id)) {
          seen.add(id);
          return r;
        }
        // append suffix until unique
        let k = 1;
        let trial = `${id}-${k}`;
        while (seen.has(trial)) {
          k += 1;
          trial = `${id}-${k}`;
        }
        seen.add(trial);
        return { ...r, [idField]: trial };
      });
      persist(newRows);
      return;
    }

    if (issue.code === "BROKEN_JSON") {
      // try to auto fix by parsing attempts
      const idx = issue.rowIndex ?? -1;
      if (idx >= 0 && rows[idx]) {
        const raw = String(rows[idx].AttributesJSON ?? "");
        try {
          const parsed = JSON.parse(raw);
          rows[idx].AttributesJSON = JSON.stringify(parsed);
          persist(rows);
          return;
        } catch {
          // attempt relax fixes: replace single quotes, remove trailing commas
          try {
            const attempt = raw
              .replace(/'/g, '"')
              .replace(/,\s*}/g, "}")
              .replace(/,\s*]/g, "]");
            const parsed = JSON.parse(attempt);
            rows[idx].AttributesJSON = JSON.stringify(parsed);
            persist(rows);
            return;
          } catch {}
        }
      }
      // if not fixable, do nothing
      return;
    }

    if (issue.code === "MALFORMED_LIST") {
      // try to normalize list fields using the normalization helpers
      const idx = issue.rowIndex ?? -1;
      if (idx >= 0 && rows[idx]) {
        const col = issue.column;
        const value = rows[idx][col!];
        // for number lists
        try {
          const n = require("@/lib/normalize") as any;
          // Try number list first
          if (n.parseNumberList) {
            const parsed = n.parseNumberList(value);
            if (parsed.ok) {
              rows[idx][col!] = parsed.arr;
              persist(rows);
              return;
            }
          }
        } catch {}
        // fallback: try string list
        try {
          const n2 = require("@/lib/normalize") as any;
          if (n2.parseStringList) {
            const parsed = n2.parseStringList(value);
            if (parsed.ok) {
              rows[idx][col!] = parsed.arr;
              persist(rows);
              return;
            }
          }
        } catch {}
      }
      return;
    }

    if (issue.code === "OUT_OF_RANGE") {
      const idx = issue.rowIndex ?? -1;
      if (idx >= 0 && rows[idx]) {
        const col = issue.column;
        const clamp = issue.payload?.clampTo;
        if (clamp !== undefined) {
          rows[idx][col!] = clamp;
          persist(rows);
        }
      }
      return;
    }

    if (issue.code === "OVERLOADED_WORKER") {
      const idx = issue.rowIndex ?? -1;
      if (idx >= 0 && rows[idx]) {
        const suggested = issue.payload?.suggested ?? 0;
        rows[idx].MaxLoadPerPhase = suggested;
        persist(rows);
      }
      return;
    }

    // fallback: no-op
  },
}));
