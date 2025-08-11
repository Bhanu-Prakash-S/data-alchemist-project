"use client";

import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { themeQuartz } from "ag-grid-community";

// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-material.css";

export default function EntityGrid() {
  const { activeEntity, clients, workers, tasks } = useAppStore();
  const rowData =
    activeEntity === "Clients"
      ? clients
      : activeEntity === "Workers"
      ? workers
      : tasks;

  const columnDefs = useMemo(() => {
    if (!rowData.length) return [];
    return Object.keys(rowData[0]).map((key) => ({
      headerName: key,
      field: key,
      editable: true,
    }));
  }, [rowData]);

  if (!rowData.length) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <AgGridReact
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
      />
    </div>
  );
}
