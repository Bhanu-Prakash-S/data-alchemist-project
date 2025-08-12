import { EntityType } from "./validationEngine";

export const REQUIRED_COLUMNS = {
  Clients: [
    "ClientID",
    "ClientName",
    "PriorityLevel",
    "RequestedTaskIDs",
    "GroupTag",
    "AttributesJSON",
  ],
  Workers: [
    "WorkerID",
    "WorkerName",
    "Skills",
    "AvailableSlots",
    "MaxLoadPerPhase",
    "WorkerGroup",
    "QualificationLevel",
  ],
  Tasks: [
    "TaskID",
    "TaskName",
    "Category",
    "Duration",
    "RequiredSkills",
    "PreferredPhases",
    "MaxConcurrent",
  ],
};

// Utility to normalize column names for comparison
export function normalizeColumnName(name: string): string {
  return name.replace(/[\s_]+/g, "").toLowerCase();
}

export const ENTITY_ID_FIELDS: Record<EntityType, string> = {
  Clients: "ClientID",
  Workers: "WorkerID",
  Tasks: "TaskID",
};
