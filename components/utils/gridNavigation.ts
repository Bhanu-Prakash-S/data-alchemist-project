import { ENTITY_ID_FIELDS } from "@/lib/constants";
import { EntityType, ValidationIssue } from "@/lib/validationEngine";

export function navigateToIssue(
  activeEntity: EntityType,
  rowData: any[],
  api: any
) {
  (window as any).__dataAlch_navigateToIssue = (issue: ValidationIssue) => {
    try {
      const idField = ENTITY_ID_FIELDS[activeEntity];
      const allRows = api.getDisplayedRowCount();

      for (let i = 0; i < allRows; i++) {
        const node = api.getDisplayedRowAtIndex(i);
        const val = node?.data?.[idField] ?? String(i);
        if (String(val) === String(issue.rowId) || i === issue.rowIndex) {
          api.ensureIndexVisible(i);
          const colKey = issue.column ?? Object.keys(rowData[0] || {})[0];
          api.flashCells({
            rowNodes: [node],
            columns: [colKey],
          });
          api.setFocusedCell(i, colKey);
          break;
        }
      }
    } catch (e) {
      console.warn("navigate issue failed", e);
    }
  };
}
