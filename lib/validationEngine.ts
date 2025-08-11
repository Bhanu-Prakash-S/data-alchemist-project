// /lib/validationEngine.ts
import { parseJSONSafe, parseNumberList, parseStringList } from "./normalize";

export type EntityType = "Clients" | "Workers" | "Tasks";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  entity: EntityType;
  rowId?: string;
  rowIndex?: number;
  column?: string;
  type: ValidationSeverity;
  code: string;
  message: string;
  fixable?: boolean;
  // optional payload for quick fix
  payload?: any;
}

function mkIssue(overrides: Partial<ValidationIssue>): ValidationIssue {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    entity: "Clients",
    type: "error",
    code: "GENERIC",
    message: "validation",
    ...overrides,
  } as ValidationIssue;
}

/** Required columns per entity (from spec) */
const requiredColumns: Record<EntityType, string[]> = {
  Clients: ["ClientID", "ClientName", "PriorityLevel", "RequestedTaskIDs"],
  Workers: [
    "WorkerID",
    "WorkerName",
    "Skills",
    "AvailableSlots",
    "MaxLoadPerPhase",
  ],
  Tasks: ["TaskID", "TaskName", "Duration", "RequiredSkills"],
};

/** Helper: extract header names from rows (first object) */
function getHeaders(rows: any[]) {
  if (!rows || !rows.length) return [];
  return Object.keys(rows[0]);
}

/** Validators below each accept data object and return ValidationIssue[] */
export function validateRequiredColumns(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];
  (["Clients", "Workers", "Tasks"] as EntityType[]).forEach((entity) => {
    const rows = data[entity];
    const headers = getHeaders(rows);
    requiredColumns[entity].forEach((col) => {
      if (!headers.includes(col)) {
        issues.push(
          mkIssue({
            entity,
            type: "error",
            code: "MISSING_COLUMN",
            message: `Missing required column "${col}"`,
            fixable: true,
            payload: { missingColumn: col },
          })
        );
      }
    });
  });
  return issues;
}

export function validateDuplicateIDs(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];
  const mapping: Record<EntityType, string> = {
    Clients: "ClientID",
    Workers: "WorkerID",
    Tasks: "TaskID",
  };
  (["Clients", "Workers", "Tasks"] as EntityType[]).forEach((entity) => {
    const idField = mapping[entity];
    const rows = data[entity] || [];
    const freq: Record<string, number[]> = {};
    rows.forEach((r: any, idx: number) => {
      const id = String(r[idField] ?? `__row_${idx}`);
      freq[id] = freq[id] || [];
      freq[id].push(idx);
    });
    Object.entries(freq).forEach(([id, indices]) => {
      if (id === "__row_undefined") return;
      if (indices.length > 1) {
        indices.forEach((i) =>
          issues.push(
            mkIssue({
              entity,
              rowId: id,
              rowIndex: i,
              column: idField,
              type: "error",
              code: "DUPLICATE_ID",
              message: `Duplicate ${idField} "${id}"`,
              fixable: true,
              payload: { idField, duplicateFor: id },
            })
          )
        );
      }
    });
  });
  return issues;
}

export function validateMalformedLists(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];

  // Workers.AvailableSlots -> number list
  (data.Workers || []).forEach((r: any, idx: number) => {
    if (r.AvailableSlots == null || r.AvailableSlots === "") return;
    const parsed = parseNumberList(r.AvailableSlots);
    if (!parsed.ok) {
      issues.push(
        mkIssue({
          entity: "Workers",
          rowIndex: idx,
          rowId: String(r.WorkerID ?? idx),
          column: "AvailableSlots",
          type: "error",
          code: "MALFORMED_LIST",
          message: `AvailableSlots value "${r.AvailableSlots}" is malformed`,
          fixable: true,
          payload: { suggested: [] },
        })
      );
    }
  });

  // Clients.RequestedTaskIDs -> string list
  (data.Clients || []).forEach((r: any, idx: number) => {
    if (r.RequestedTaskIDs == null || r.RequestedTaskIDs === "") return;
    const parsed = parseStringList(r.RequestedTaskIDs);
    if (!parsed.ok) {
      issues.push(
        mkIssue({
          entity: "Clients",
          rowIndex: idx,
          rowId: String(r.ClientID ?? idx),
          column: "RequestedTaskIDs",
          type: "error",
          code: "MALFORMED_LIST",
          message: `RequestedTaskIDs value "${r.RequestedTaskIDs}" is malformed`,
          fixable: true,
        })
      );
    }
  });

  // Tasks.RequiredSkills -> string list
  (data.Tasks || []).forEach((r: any, idx: number) => {
    if (r.RequiredSkills == null || r.RequiredSkills === "") return;
    const parsed = parseStringList(r.RequiredSkills);
    if (!parsed.ok) {
      issues.push(
        mkIssue({
          entity: "Tasks",
          rowIndex: idx,
          rowId: String(r.TaskID ?? idx),
          column: "RequiredSkills",
          type: "error",
          code: "MALFORMED_LIST",
          message: `RequiredSkills value "${r.RequiredSkills}" is malformed`,
          fixable: true,
        })
      );
    }
  });

  return issues;
}

export function validateBrokenJSON(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];

  (data.Clients || []).forEach((r: any, idx: number) => {
    if (r.AttributesJSON == null || r.AttributesJSON === "") return;
    const parsed = parseJSONSafe(r.AttributesJSON);
    if (!parsed.ok) {
      issues.push(
        mkIssue({
          entity: "Clients",
          rowIndex: idx,
          rowId: String(r.ClientID ?? idx),
          column: "AttributesJSON",
          type: "error",
          code: "BROKEN_JSON",
          message: `AttributesJSON is not valid JSON: ${parsed.error}`,
          fixable: true,
          payload: { raw: r.AttributesJSON },
        })
      );
    }
  });

  return issues;
}

export function validateOutOfRangeValues(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];

  // PriorityLevel 1..5 (clients)
  (data.Clients || []).forEach((r: any, idx: number) => {
    const v = Number(r.PriorityLevel);
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      issues.push(
        mkIssue({
          entity: "Clients",
          rowIndex: idx,
          rowId: String(r.ClientID ?? idx),
          column: "PriorityLevel",
          type: "error",
          code: "OUT_OF_RANGE",
          message: `PriorityLevel "${r.PriorityLevel}" must be integer 1..5`,
          fixable: true,
          payload: { clampTo: Math.min(Math.max(Math.round(v || 3), 1), 5) },
        })
      );
    }
  });

  // Duration >= 1 (tasks)
  (data.Tasks || []).forEach((r: any, idx: number) => {
    const v = Number(r.Duration);
    if (!Number.isFinite(v) || v < 1) {
      issues.push(
        mkIssue({
          entity: "Tasks",
          rowIndex: idx,
          rowId: String(r.TaskID ?? idx),
          column: "Duration",
          type: "error",
          code: "OUT_OF_RANGE",
          message: `Duration "${r.Duration}" must be >= 1`,
          fixable: true,
          payload: { clampTo: Math.max(Math.round(v || 1), 1) },
        })
      );
    }
  });

  // MaxLoadPerPhase >= 0 (workers)
  (data.Workers || []).forEach((r: any, idx: number) => {
    const v = Number(r.MaxLoadPerPhase);
    if (!Number.isFinite(v) || v < 0) {
      issues.push(
        mkIssue({
          entity: "Workers",
          rowIndex: idx,
          rowId: String(r.WorkerID ?? idx),
          column: "MaxLoadPerPhase",
          type: "error",
          code: "OUT_OF_RANGE",
          message: `MaxLoadPerPhase "${r.MaxLoadPerPhase}" must be >= 0`,
          fixable: true,
          payload: { clampTo: Math.max(Math.round(v || 0), 0) },
        })
      );
    }
  });

  return issues;
}

export function validateUnknownReferences(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];
  const taskIds = new Set((data.Tasks || []).map((t: any) => String(t.TaskID)));
  (data.Clients || []).forEach((r: any, idx: number) => {
    if (!r.RequestedTaskIDs) return;
    const parse = parseStringList(r.RequestedTaskIDs);
    if (!parse.ok) {
      // will already be flagged by malformed lists
      return;
    }
    parse.arr.forEach((tid) => {
      if (!taskIds.has(String(tid))) {
        issues.push(
          mkIssue({
            entity: "Clients",
            rowIndex: idx,
            rowId: String(r.ClientID ?? idx),
            column: "RequestedTaskIDs",
            type: "error",
            code: "UNKNOWN_REF",
            message: `RequestedTaskID "${tid}" does not exist in Tasks`,
            fixable: false,
          })
        );
      }
    });
  });
  return issues;
}

export function validateOverloadedWorkers(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];
  (data.Workers || []).forEach((r: any, idx: number) => {
    const parsed = parseNumberList(r.AvailableSlots);
    const slots = parsed.ok ? parsed.arr : [];
    const maxLoad = Number(r.MaxLoadPerPhase);
    if (
      Number.isFinite(maxLoad) &&
      slots.length < Math.max(0, Math.round(maxLoad || 0))
    ) {
      issues.push(
        mkIssue({
          entity: "Workers",
          rowIndex: idx,
          rowId: String(r.WorkerID ?? idx),
          column: "MaxLoadPerPhase",
          type: "warning",
          code: "OVERLOADED_WORKER",
          message: `Worker claims MaxLoadPerPhase=${maxLoad} but has only ${slots.length} available slots`,
          fixable: true,
          payload: { suggested: slots.length },
        })
      );
    }
  });
  return issues;
}

export function validateSkillCoverage(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  const issues: ValidationIssue[] = [];
  // build skill set available in workers
  const workerSkills = new Set<string>();
  (data.Workers || []).forEach((w: any) => {
    const parsed = parseStringList(w.Skills);
    if (parsed.ok) parsed.arr.forEach((s) => workerSkills.add(s.toLowerCase()));
  });
  (data.Tasks || []).forEach((t: any, idx: number) => {
    if (!t.RequiredSkills) return;
    const parsed = parseStringList(t.RequiredSkills);
    if (!parsed.ok) return;
    const missing = parsed.arr.filter(
      (s) => !workerSkills.has(String(s).toLowerCase())
    );
    if (missing.length) {
      issues.push(
        mkIssue({
          entity: "Tasks",
          rowIndex: idx,
          rowId: String(t.TaskID ?? idx),
          column: "RequiredSkills",
          type: "warning",
          code: "SKILL_COVERAGE",
          message: `Task requires skill(s) not present among workers: ${missing.join(
            ", "
          )}`,
          fixable: false,
        })
      );
    }
  });
  return issues;
}

/** Main runner */
export function runAllValidators(data: {
  Clients: any[];
  Workers: any[];
  Tasks: any[];
}) {
  let issues: ValidationIssue[] = [];
  issues = issues.concat(validateRequiredColumns(data));
  issues = issues.concat(validateDuplicateIDs(data));
  issues = issues.concat(validateMalformedLists(data));
  issues = issues.concat(validateBrokenJSON(data));
  issues = issues.concat(validateOutOfRangeValues(data));
  issues = issues.concat(validateUnknownReferences(data));
  issues = issues.concat(validateOverloadedWorkers(data));
  issues = issues.concat(validateSkillCoverage(data));
  return issues;
}
