export type RuleType =
  | "coRun"
  | "slotRestriction"
  | "loadLimit"
  | "phaseWindow"
  | "patternMatch";

export interface BaseRule {
  id: string; // UUID
  type: RuleType;
  description?: string; // optional human-readable note
}

/** Run selected tasks together */
export interface CoRunRule extends BaseRule {
  type: "coRun";
  tasks: string[]; // TaskIDs
}

/** Restrict slots for a client group or worker group */
export interface SlotRestrictionRule extends BaseRule {
  type: "slotRestriction";
  groupType: "clientGroup" | "workerGroup";
  groupId: string;
  minCommonSlots: number;
}

/** Limit load per phase for a worker group */
export interface LoadLimitRule extends BaseRule {
  type: "loadLimit";
  groupType: "workerGroup";
  groupId: string;
  maxSlotsPerPhase: number;
}

/** Restrict allowed phases for a task */
export interface PhaseWindowRule extends BaseRule {
  type: "phaseWindow";
  taskId: string;
  allowedPhases: number[]; // e.g. [1, 2, 3]
}

/** Apply rules based on regex pattern match */
export interface PatternMatchRule extends BaseRule {
  type: "patternMatch";
  regex: string; // JS-style regex pattern string
  templateId: string; // ID of predefined template
  params: Record<string, any>; // dynamic parameters
}

/** Weight/Priority settings */
export interface WeightSettings {
  method: "sliders" | "ranking" | "presets";
  weights: Record<string, number>; // e.g. { priorityLevel: 5, fairness: 3 }
  ranking?: string[]; // criteria IDs in order of importance
  presetId?: string; // if method = presets
}

/** Main export schema */
export interface RulesConfig {
  rules: Rule[];
  weights: WeightSettings;
}

export interface Rule {
  id: string;
  type: RuleType;
  [key: string]: any;
}
