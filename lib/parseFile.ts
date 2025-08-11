import * as XLSX from "xlsx";
import { EntityType } from "@/store/useAppStore";

export function parseExcel(file: File) {
  return new Promise<Record<EntityType, any[]>>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const entities: Record<EntityType, any[]> = {
        Clients: [],
        Workers: [],
        Tasks: [],
      };

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        if (sheetName.toLowerCase().includes("client")) {
          entities.Clients = json;
        } else if (sheetName.toLowerCase().includes("worker")) {
          entities.Workers = json;
        } else if (sheetName.toLowerCase().includes("task")) {
          entities.Tasks = json;
        }
      });

      resolve(entities);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
