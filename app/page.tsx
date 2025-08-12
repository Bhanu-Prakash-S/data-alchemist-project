"use client";
import BusinessRulesPanel from "@/components/BusinessRulesPanel";
import EntityGrid from "@/components/EntityGrid";
import FileDropper from "@/components/FileDropper";
import ValidationPanel from "@/components/ValidationPanel";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
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
    <div className="p-4 w-full h-screen relative">
      {activeView === "Business Rules" ? (
        <BusinessRulesPanel />
      ) : isEntityView && data.length ? (
        <EntityGrid entity={activeView} />
      ) : (
        activeView !== "Validation Issues" && <FileDropper />
      )}
      <ValidationPanel />
    </div>
  );
}
