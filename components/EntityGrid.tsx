"use client";
import React, { useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { useAppStore } from "@/store/useAppStore";
import { EntityType } from "@/lib/validationEngine";
import { useValidationLookup } from "./utils/useValidationLookup";
import { debounce } from "lodash";
import { navigateToIssue } from "./utils/gridNavigation";
import { useColumnDefs } from "./utils/useColumnDefs";
import {
  themeQuartz,
  GridReadyEvent,
  CellValueChangedEvent,
} from "ag-grid-community";

function useDebouncedStoreUpdater(setData: any, runAllValidators: any) {
  return useCallback(
    debounce((entity: EntityType, newRows: any[]) => {
      setData(entity, newRows);
      setTimeout(() => runAllValidators(), 120);
    }, 400),
    [setData, runAllValidators]
  );
}

export default function EntityGrid({
  entity,
}: {
  entity: "Clients" | "Workers" | "Tasks";
}) {
  const {
    clients,
    workers,
    tasks,
    validationIssues,
    setData,
    runAllValidators,
  } = useAppStore();

  const rowData =
    entity === "Clients" ? clients : entity === "Workers" ? workers : tasks;

  const gridApiRef = useRef<any>(null);

  const validationLookup = useValidationLookup(validationIssues, entity);
  const columnDefs = useColumnDefs(rowData, validationLookup, entity);
  const updateStoreDebounced = useDebouncedStoreUpdater(
    setData,
    runAllValidators
  );

  const onCellValueChanged = useCallback(
    (params: CellValueChangedEvent) => {
      const allData: any[] = [];
      params.api.forEachNode((node) => {
        if (node.data) allData.push(node.data);
      });
      updateStoreDebounced(entity, allData);
    },
    [entity, updateStoreDebounced]
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApiRef.current = params.api;
      navigateToIssue(entity, rowData, params.api);
    },
    [entity, rowData]
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
