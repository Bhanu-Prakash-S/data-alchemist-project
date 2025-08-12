import { ENTITY_ID_FIELDS } from "@/lib/constants";
import { EntityType } from "@/lib/validationEngine";
import { useMemo } from "react";

export function useColumnDefs(
  rowData: any[],
  validationLookup: Record<string, Record<string, Set<string>>>,
  activeEntity: EntityType
) {
  return useMemo(() => {
    if (!rowData || !rowData.length) return [];

    return Object.keys(rowData[0]).map((key) => ({
      headerName: key,
      field: key,
      editable: true,
      cellClass: (params: any) => {
        const idField = ENTITY_ID_FIELDS[activeEntity];
        const rowId = String(params.data?.[idField] ?? params.rowIndex);
        const lookup = validationLookup[rowId];
        if (!lookup) return "";
        return lookup[key] || lookup["__ROW"] ? "cell-error" : "";
      },
    }));
  }, [rowData, validationLookup, activeEntity]);
}
