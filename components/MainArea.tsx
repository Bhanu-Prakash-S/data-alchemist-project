"use client";
import BusinessRulesPanel from "@/components/BusinessRulesPanel";
import FileDropper from "@/components/FileDropper";
import ValidationPanel from "@/components/ValidationPanel";
import ResizablePanels from "@/components/ResizablePanels";
import EntityWithValidation from "@/components/EntityWithValidation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function MainArea() {
  const { activeView, clients, workers, tasks, loadFromLocalStorage } =
    useAppStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const isEntityView =
    activeView === "Clients" ||
    activeView === "Workers" ||
    activeView === "Tasks";

  const data = isEntityView
    ? activeView === "Clients"
      ? clients
      : activeView === "Workers"
      ? workers
      : tasks
    : [];

  return (
    <div className="h-screen w-full bg-gray-50">
      {isEntityView && data.length ? (
        <EntityWithValidation entity={activeView} />
      ) : (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 p-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
              <FileDropper />
            </div>
          </div>
          <div className="p-2 pt-0" style={{ height: "40%" }}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full">
              <ValidationPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
