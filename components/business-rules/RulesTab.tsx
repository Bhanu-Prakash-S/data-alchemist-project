"use client";

import { Button } from "@/components/ui/button";
import { useRulesStore } from "@/store/useRulesStore";
import { useState } from "react";
import RuleFormModal from "./RuleFormModal";

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

      <ul className="divide-y">
        {rules.map((rule) => (
          <li key={rule.id} className="flex justify-between items-center py-2">
            <span>{rule.description}</span>
            <div className="space-x-2">
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
          </li>
        ))}
      </ul>

      <RuleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editRule={editRule}
      />
    </div>
  );
}
