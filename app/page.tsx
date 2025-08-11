"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import FileDropper from "@/components/FileDropper";
import EntityGrid from "@/components/EntityGrid";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  const { activeEntity, clients, workers, tasks, loadFromLocalStorage } =
    useAppStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const data =
    activeEntity === "Clients"
      ? clients
      : activeEntity === "Workers"
      ? workers
      : tasks;

  return (
    <div className="p-4 w-full h-screen">
      {data.length ? <EntityGrid /> : <FileDropper />}
    </div>
  );
}
