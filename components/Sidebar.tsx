"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAppStore } from "../store/useAppStore";
import type { EntityType } from "@/lib/validationEngine";

export default function Sidebar() {
  const { activeView, setActiveView, validationIssues } = useAppStore();

  const menuItems: {
    name: EntityType | "Business Rules";
    badge?: number;
  }[] = [
    { name: "Clients" },
    { name: "Workers" },
    { name: "Tasks" },
    { name: "Business Rules" },
  ];

  return (
    <div className="flex flex-col w-60 h-screen border-r p-4 space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.name}
          variant={activeView === item.name ? "default" : "outline"}
          className="justify-between"
          onClick={() => {
            setActiveView(item.name);
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
