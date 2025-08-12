"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import FileDropper from "@/components/FileDropper";
import EntityGrid from "@/components/EntityGrid";
import ValidationPanel from "@/components/ValidationPanel";
import BusinessRulesPanel from "@/components/BusinessRulesPanel";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  const { activeView, clients, workers, tasks, loadFromLocalStorage } =
    useAppStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const data =
    activeView === "Clients"
      ? clients
      : activeView === "Workers"
      ? workers
      : activeView === "Tasks"
      ? tasks
      : [];

  return (
    <div className="p-4 w-full h-screen relative">
      {activeView === "Business Rules" ? (
        <BusinessRulesPanel />
      ) : data.length ? (
        <EntityGrid />
      ) : (
        <FileDropper />
      )}
      <ValidationPanel />
    </div>
  );
}
