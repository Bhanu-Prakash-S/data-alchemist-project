import * as XLSX from "xlsx";
import { EntityType } from "./validationEngine";
import { parseNumberList } from "@/lib/normalize";

function normalizeEntities(entities: Record<EntityType, any[]>) {
  return {
    Clients: entities.Clients, // untouched

    Workers: entities.Workers.map((worker) => {
      const slotsParsed = parseNumberList(worker.AvailableSlots);
      return {
        ...worker,
        AvailableSlots: slotsParsed.ok
          ? slotsParsed.arr
          : worker.AvailableSlots,
      };
    }),

    Tasks: entities.Tasks.map((task) => {
      const phasesParsed = parseNumberList(task.PreferredPhases);
      return {
        ...task,
        PreferredPhases: phasesParsed.ok
          ? phasesParsed.arr
          : task.PreferredPhases,
      };
    }),
  };
}

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

      const normalized = normalizeEntities(entities);
      resolve(normalized);
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
