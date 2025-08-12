"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useState, useEffect } from "react";
import { useRulesStore, RuleType, Rule } from "@/store/useRulesStore";
import { v4 as uuidv4 } from "uuid";

interface RuleFormModalProps {
  open: boolean;
  onClose: () => void;
  editRule?: Rule;
}

export default function RuleFormModal({
  open,
  onClose,
  editRule,
}: RuleFormModalProps) {
  const { addRule, updateRule } = useRulesStore();

  const [type, setType] = useState<RuleType>("coRun");
  const [tasks, setTasks] = useState<string[]>([]);

  useEffect(() => {
    if (editRule) {
      setType(editRule.type);
      setTasks(editRule.config?.tasks || []);
    } else {
      setType("coRun");
      setTasks([]);
    }
  }, [editRule, open]);

  const save = () => {
    const newConfig = { tasks };

    if (editRule) {
      updateRule(editRule.id, {
        type,
        config: newConfig,
        description: `${type} rule for ${tasks.join(", ")}`,
      });
    } else {
      addRule({
        id: uuidv4(),
        type,
        description: `${type} rule for ${tasks.join(", ")}`,
        config: newConfig,
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>

        {/* Example: Task selection */}
        <MultiSelect
          options={[
            { label: "Task A", value: "T1" },
            { label: "Task B", value: "T2" },
            { label: "Task C", value: "T3" },
          ]}
          selected={tasks}
          onChange={setTasks}
          placeholder="Select tasks for co-run"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
