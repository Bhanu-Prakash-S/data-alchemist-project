"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { utils, write } from "xlsx";
import JSZip from "jszip";
import { useAppStore } from "@/store/useAppStore";
import { useRulesStore } from "@/store/useRulesStore";

export default function BusinessRulesFooter() {
  const { clients, workers, tasks } = useAppStore();
  const { rules, priorities } = useRulesStore();

  const handleExport = async () => {
    const zip = new JSZip();

    // 1️⃣ Create Excel workbook (as array buffer instead of saving directly)
    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.json_to_sheet(clients), "Clients");
    utils.book_append_sheet(wb, utils.json_to_sheet(workers), "Workers");
    utils.book_append_sheet(wb, utils.json_to_sheet(tasks), "Tasks");

    const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
    zip.file("data.xlsx", excelBuffer);

    // 2️⃣ Create JSON rules file
    const rulesConfig = { rules, priorities };
    zip.file("rules.json", JSON.stringify(rulesConfig, null, 2));

    // 3️⃣ Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "export.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border-t flex justify-end">
      <Button onClick={handleExport}>Export Data + Rules (ZIP)</Button>
    </div>
  );
}
