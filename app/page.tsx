"use client";
import BusinessRulesPanel from "@/components/BusinessRulesPanel";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import MainArea from "@/components/MainArea";

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
    <div className=" w-full h-screen relative">
      {activeView === "Business Rules" ? <BusinessRulesPanel /> : <MainArea />}
    </div>
  );
}
