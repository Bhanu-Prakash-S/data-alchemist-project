"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRulesStore } from "@/store/useRulesStore";

// Placeholder components for now
function RulesTab() {
  const { rules } = useRulesStore();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Rules</h2>
      {rules.length === 0 ? (
        <p className="text-gray-500">No rules added yet.</p>
      ) : (
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="border rounded p-2 flex justify-between"
            >
              <span>{rule.description}</span>
              <span className="text-xs text-gray-500">{rule.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrioritizationTab() {
  const { priorities } = useRulesStore();
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Prioritization</h2>
      <pre className="bg-gray-100 p-2 rounded text-sm">
        {JSON.stringify(priorities, null, 2)}
      </pre>
    </div>
  );
}

export default function BusinessRulesPanel() {
  const [activeTab, setActiveTab] = useState<"rules" | "priorities">("rules");

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b flex">
        <Button
          variant={activeTab === "rules" ? "default" : "ghost"}
          onClick={() => setActiveTab("rules")}
        >
          Rules
        </Button>
        <Button
          variant={activeTab === "priorities" ? "default" : "ghost"}
          onClick={() => setActiveTab("priorities")}
        >
          Prioritization
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "rules" && <RulesTab />}
        {activeTab === "priorities" && <PrioritizationTab />}
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-end">
        <Button onClick={() => alert("Export logic will go here")}>
          Export Rules + Data
        </Button>
      </div>
    </div>
  );
}
