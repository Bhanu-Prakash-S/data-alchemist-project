"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAppStore } from "../store/useAppStore";
import type { EntityType } from "@/lib/validationEngine";

export default function Sidebar() {
  const {
    activeEntity,
    setActiveEntity,
    toggleValidationPanel,
    validationIssues,
  } = useAppStore();
  const menuItems: {
    name: EntityType | "Validation Issues" | "Rules";
    badge?: number;
  }[] = [
    { name: "Clients" },
    { name: "Workers" },
    { name: "Tasks" },
    { name: "Validation Issues", badge: validationIssues.length },
    { name: "Rules" },
  ];

  return (
    <div className="flex flex-col w-60 h-screen border-r p-4 space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.name}
          variant={activeEntity === item.name ? "default" : "outline"}
          className="justify-between"
          onClick={() => {
            if (item.name === "Validation Issues")
              return toggleValidationPanel(true);
            if (item.name === "Rules") return;
            setActiveEntity(item.name as EntityType);
          }}
        >
          {item.name}
          {item.badge !== undefined && (
            <Badge variant="secondary">{item.badge}</Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
