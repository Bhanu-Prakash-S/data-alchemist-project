"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRulesStore } from "@/store/useRulesStore";
import { useState } from "react";
import RuleFormModal from "./RuleFormModal";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  coRun: "bg-blue-100 text-blue-800",
  slotRestriction: "bg-orange-100 text-orange-800",
  loadLimit: "bg-green-100 text-green-800",
  phaseWindow: "bg-purple-100 text-purple-800",
  patternMatch: "bg-pink-100 text-pink-800",
};

export default function RulesTab() {
  const { rules, deleteRule } = useRulesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setEditRule(null);
          setModalOpen(true);
        }}
      >
        Add Rule
      </Button>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between bg-white rounded-md shadow-sm border p-3 hover:shadow-md hover:bg-gray-50 transition-all"
          >
            {/* Left: Type Badge + Description */}
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  "capitalize",
                  typeColors[rule.type] || "bg-gray-100 text-gray-800"
                )}
              >
                {rule.type}
              </Badge>
              <span className="text-sm text-gray-800 truncate max-w-xs">
                {rule.description || (
                  <span className="italic text-gray-400">No description</span>
                )}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditRule(rule);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteRule(rule.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <RuleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editRule={editRule}
      />
    </div>
  );
}
