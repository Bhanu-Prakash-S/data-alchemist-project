import { ValidationIssue, EntityType } from "@/lib/validationEngine";
import { useMemo } from "react";

export function useValidationLookup(
  validationIssues: ValidationIssue[],
  activeEntity: EntityType
) {
  return useMemo(() => {
    const map: Record<string, Record<string, Set<string>>> = {};
    validationIssues.forEach((iss) => {
      if (iss.entity !== activeEntity) return;
      const rowKey = String(iss.rowId ?? iss.rowIndex ?? "__row");
      map[rowKey] = map[rowKey] || {};
      map[rowKey][iss.column ?? "__ROW"] = (
        map[rowKey][iss.column ?? "__ROW"] || new Set()
      ).add(iss.column ?? "__ROW");
    });
    return map;
  }, [validationIssues, activeEntity]);
}
