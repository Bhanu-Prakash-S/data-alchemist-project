"use client";
import BusinessRulesPanel from "@/components/BusinessRulesPanel";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import MainArea from "@/components/MainArea";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  const { activeView, loadFromLocalStorage } = useAppStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <div className=" w-full h-screen relative">
      {activeView === "Business Rules" ? <BusinessRulesPanel /> : <MainArea />}
    </div>
  );
}
