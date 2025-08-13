"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import EntityGrid from "@/components/EntityGrid";
import ValidationPanel from "@/components/ValidationPanel";

export default function EntityWithValidation({
  entity,
}: {
  entity: "Clients" | "Workers" | "Tasks";
}) {
  const [entityGridHeight, setEntityGridHeight] = useState(80); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startY = e.clientY;
      const startHeight = entityGridHeight;
      const containerHeight = containerRef.current?.clientHeight || 600;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = e.clientY - startY;
        const deltaPercentage = (deltaY / containerHeight) * 100;
        const newHeight = Math.max(
          15,
          Math.min(80, startHeight + deltaPercentage)
        ); // Between 30% and 80%
        setEntityGridHeight(newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [entityGridHeight]
  );

  const validationPanelHeight = 100 - entityGridHeight - 1; // 1% for gap

  return (
    <div ref={containerRef} className="w-full h-screen p-2 flex flex-col gap-1">
      {/* EntityGrid Panel */}
      <div
        className="bg-white border rounded-lg shadow-sm overflow-hidden"
        style={{ height: `${entityGridHeight}%`, minHeight: "50px" }}
      >
        <EntityGrid entity={entity} />
      </div>

      {/* Resize Handle */}
      <div className="flex justify-center items-center h-2 relative">
        <div
          className={`w-20 h-1 rounded-full cursor-row-resize transition-colors
                     ${
                       isResizing
                         ? "bg-blue-500"
                         : "bg-gray-300 hover:bg-gray-400"
                     }`}
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* ValidationPanel */}
      <div
        className=" border rounded-lg shadow-sm overflow-hidden"
        style={{ height: `${validationPanelHeight}%`, minHeight: "50px" }}
      >
        <ValidationPanel />
      </div>
    </div>
  );
}
