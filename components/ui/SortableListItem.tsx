// components/ui/SortableListItem.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "border rounded-md px-3 py-2 flex items-center gap-2 bg-white shadow-sm"
      )}
    >
      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
      <span>{id}</span>
    </div>
  );
}
