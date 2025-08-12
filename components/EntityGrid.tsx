// /components/EntityGrid.tsx
"use client";
import React, { useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { useAppStore } from "@/store/useAppStore";
// import "ag-grid-community/styles/ag-grid.css"
// import "ag-grid-community/styles/ag-theme-alpine.css"
// import { AgGridReact as AgGridReactType } from "ag-grid-react/lib/agGridReact"
import { ValidationIssue } from "@/lib/validationEngine";
import { debounce } from "lodash";
import { themeQuartz } from "ag-grid-community";

export default function EntityGrid() {
  const {
    activeEntity,
    clients,
    workers,
    tasks,
    validationIssues,
    setData,
    runAllValidators,
  } = useAppStore();
  const rowData =
    activeEntity === "Clients"
      ? clients
      : activeEntity === "Workers"
      ? workers
      : tasks;
  const gridApiRef = useRef<any>(null);

  // build validation lookup: entity -> rowId -> Set(columns)
  const validationLookup = useMemo(() => {
    const map: Record<string, Record<string, Set<string>>> = {};
    validationIssues.forEach((iss: ValidationIssue) => {
      if (iss.entity !== activeEntity) return;
      const rowKey = String(iss.rowId ?? iss.rowIndex ?? "__row");
      map[rowKey] = map[rowKey] || {};
      map[rowKey][iss.column ?? "__ROW"] = (
        map[rowKey][iss.column ?? "__ROW"] || new Set()
      ).add(iss.column ?? "__ROW");
    });
    return map;
  }, [validationIssues, activeEntity]);

  const columnDefs = useMemo(() => {
    if (!rowData || !rowData.length) return [];
    return Object.keys(rowData[0]).map((key) => ({
      headerName: key,
      field: key,
      editable: true,
      cellClass: (params: any) => {
        const idField =
          activeEntity === "Clients"
            ? "ClientID"
            : activeEntity === "Workers"
            ? "WorkerID"
            : "TaskID";
        const rowId = String(params.data?.[idField] ?? params.rowIndex);
        const lookup = validationLookup[rowId];
        if (!lookup) return "";
        if (lookup[key] || lookup["__ROW"]) return "cell-error";
        return "";
      },
    }));
  }, [rowData, validationLookup, activeEntity]);

  // on change: update zustand store and run validators (debounced)
  // find id field dynamically
  const updateStoreDebounced = useCallback(
    debounce((entity: string, newRows: any[]) => {
      setData(entity as any, newRows);
      // allow some time for persistence then re-run validators
      setTimeout(() => runAllValidators(), 120);
    }, 400),
    []
  );

  const onCellValueChanged = useCallback(
    (params: any) => {
      const updated = params.api.getRenderedNodes().map((n: any) => n.data);
      const allData: any[] = [];
      params.api.forEachNode((node: any) => {
        if (node.data) {
          allData.push(node.data);
        }
      });
      const entity = activeEntity;
      updateStoreDebounced(entity, allData);
    },
    [activeEntity, updateStoreDebounced]
  );

  const onGridReady = useCallback(
    (params: any) => {
      gridApiRef.current = params.api;
      // expose navigator to window for ValidationPanel to call
      (window as any).__dataAlch_navigateToIssue = (issue: ValidationIssue) => {
        try {
          // find row index by id field
          const idField =
            activeEntity === "Clients"
              ? "ClientID"
              : activeEntity === "Workers"
              ? "WorkerID"
              : "TaskID";
          const rowKey = String(issue.rowId ?? issue.rowIndex ?? "");
          const nodes = params.api.getRenderedNodes();
          let targetIndex = -1;
          // search full rowData
          const all = params.api.getModel().rowsToDisplay;
          for (let i = 0; i < params.api.getDisplayedRowCount(); i++) {
            const node = params.api.getDisplayedRowAtIndex(i);
            const val = node?.data?.[idField] ?? String(i);
            if (String(val) === String(issue.rowId) || i === issue.rowIndex) {
              targetIndex = i;
              break;
            }
          }
          if (targetIndex >= 0) {
            params.api.ensureIndexVisible(targetIndex);
            const colKey = issue.column ?? Object.keys(rowData[0] || {})[0];
            params.api.flashCells({
              rowNodes: [params.api.getDisplayedRowAtIndex(targetIndex)],
              columns: [colKey],
            });
            // focus
            params.api.setFocusedCell(targetIndex, colKey);
          }
        } catch (e) {
          console.warn("navigate issue failed", e);
        }
      };
    },
    [activeEntity, rowData]
  );

  if (!rowData || !rowData.length) return null;

  return (
    <div className="w-full h-full">
      <AgGridReact
        theme={themeQuartz}
        onGridReady={onGridReady}
        rowData={rowData}
        columnDefs={columnDefs as any}
        onCellValueChanged={onCellValueChanged}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
          floatingFilter: true,
          flex: 1,
        }}
        animateRows={true}
      />
      <style>{`
        .cell-error { background: rgba(255, 82, 82, 0.12) !important; }
      `}</style>
    </div>
  );
}
