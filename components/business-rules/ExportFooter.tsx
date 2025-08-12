"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { utils, writeFile } from "xlsx";
import { useAppStore } from "@/store/useAppStore";
import { useRulesStore } from "@/store/useRulesStore";

export default function BusinessRulesFooter() {
  const { clients, workers, tasks } = useAppStore();
  const { rules, priorities } = useRulesStore();

  const handleExport = () => {
    // 1️⃣ Create Excel workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.json_to_sheet(clients), "Clients");
    utils.book_append_sheet(wb, utils.json_to_sheet(workers), "Workers");
    utils.book_append_sheet(wb, utils.json_to_sheet(tasks), "Tasks");

    // Save Excel file
    writeFile(wb, "data.xlsx");

    // 2️⃣ Create JSON rules file
    const rulesConfig = { rules, priorities };
    const blob = new Blob([JSON.stringify(rulesConfig, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rules.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border-t flex justify-end">
      <Button onClick={handleExport}>Export Data + Rules</Button>
    </div>
  );
}
