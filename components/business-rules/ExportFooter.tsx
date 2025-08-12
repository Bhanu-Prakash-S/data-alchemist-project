"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useRulesStore } from "@/store/useRulesStore";

export default function ExportFooter() {
  const { clients, workers, tasks } = useAppStore();
  const { rules, priorities } = useRulesStore();

  const exportAll = () => {
    const bundle = {
      clients,
      workers,
      tasks,
      rules,
      priorities,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export_bundle.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border-t flex justify-end bg-white">
      <Button onClick={exportAll}>Export All</Button>
    </div>
  );
}
