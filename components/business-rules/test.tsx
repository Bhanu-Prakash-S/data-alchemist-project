// /components/business-rules/RuleFormModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { SortableList } from "@/components/ui/SortableList";
import { useAppStore } from "@/store/useAppStore";
import { useRulesStore, RuleType, Rule } from "@/store/useRulesStore";
import { v4 as uuidv4 } from "uuid";

interface RuleFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRule?: Rule | null;
}

export default function RuleFormModal({
  open,
  onClose,
  editingRule,
}: RuleFormModalProps) {
  const { clients = [], workers = [], tasks = [] } = useAppStore();
  const { rules = [], addRule, updateRule } = useRulesStore();

  // local form state
  const [type, setType] = useState<RuleType>(editingRule?.type ?? "coRun");
  const [description, setDescription] = useState<string>(
    editingRule?.description ?? ""
  );
  const [config, setConfig] = useState<any>(
    editingRule?.config ? { ...editingRule.config } : {}
  );

  // Re-init when editingRule / open changes
  useEffect(() => {
    if (editingRule) {
      setType(editingRule.type);
      setDescription(editingRule.description);
      setConfig(editingRule.config);
    } else {
      setType("coRun");
      setDescription("");
      setConfig({});
    }
  }, [editingRule, open]);

  // --- Derived options from latest grids ---

  // TaskID options
  const taskOptions = useMemo(
    () =>
      (tasks || []).map((t: any) => {
        const id = String(t?.TaskID ?? "");
        const name = t?.TaskName ?? "";
        return { label: id + (name ? ` — ${name}` : ""), value: id };
      }),
    [tasks]
  );

  // Client group options: derive from clients.ClientGroup or other group-like column names
  const clientGroups = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c: any) => {
      // try common group fields; fall back to explicit ClientGroup
      const group = c?.ClientGroup ?? c?.Group ?? c?.ClientGroupName ?? null;
      if (group != null && String(group).trim() !== "")
        set.add(String(group).trim());
    });
    return Array.from(set)
      .sort()
      .map((g) => ({ label: g, value: g }));
  }, [clients]);

  // Worker groups options
  const workerGroups = useMemo(() => {
    const set = new Set<string>();
    workers.forEach((w: any) => {
      const group = w?.WorkerGroup ?? w?.Group ?? w?.Team ?? null;
      if (group != null && String(group).trim() !== "")
        set.add(String(group).trim());
    });
    return Array.from(set)
      .sort()
      .map((g) => ({ label: g, value: g }));
  }, [workers]);

  // Unique phases: parse PreferredPhases from tasks; collect numeric tokens
  const phaseOptions = useMemo(() => {
    const nums = new Set<number>();
    (tasks || []).forEach((t: any) => {
      const raw = t?.PreferredPhases ?? "";
      if (raw == null) return;
      const s = String(raw);
      // match numbers (e.g. "1", "2", or tokens inside [1 - 2], "1,2", "1-3")
      // We'll extract all integer occurrences
      const matches = s.match(/\d+/g);
      if (matches) {
        matches.forEach((m) => {
          const n = Number(m);
          if (Number.isFinite(n)) nums.add(n);
        });
      }
    });
    return Array.from(nums)
      .sort((a, b) => a - b)
      .map((n) => ({ label: String(n), value: String(n) }));
  }, [tasks]);

  // regex-targetable columns: choose string-like columns for each entity
  const stringColumnsByEntity = useMemo(() => {
    function getStringLikeColumns(rows: any[]) {
      if (!rows || rows.length === 0) return [] as string[];
      const keys = Object.keys(rows[0] || {});
      return keys.filter((k) => {
        // check sample values; if any value is string, consider string-like
        for (let i = 0; i < rows.length; i++) {
          const v = rows[i][k];
          if (v == null) continue;
          if (typeof v === "string") return true;
          // if not string but contains letters when coerced, still OK
          if (typeof v === "number") continue;
          if (typeof v === "object") continue;
        }
        // fallback: include column names that look like text fields
        const name = k.toLowerCase();
        if (
          name.includes("name") ||
          name.includes("desc") ||
          name.includes("skill") ||
          name.includes("region")
        )
          return true;
        return false;
      });
    }
    return {
      Clients: getStringLikeColumns(clients),
      Workers: getStringLikeColumns(workers),
      Tasks: getStringLikeColumns(tasks),
    };
  }, [clients, workers, tasks]);

  // existing rule choices for precedence override: show array of "id — desc"
  const existingRuleItems = useMemo(() => {
    return (rules || []).map((r: Rule) => ({
      label: `${r.id}${r.description ? ` — ${r.description}` : ""}`,
      value: r.id,
    }));
  }, [rules]);

  // ---- Validation helpers ----
  const validate = (): { ok: true } | { ok: false; message: string } => {
    switch (type) {
      case "coRun": {
        const arr = config.tasks || [];
        if (!Array.isArray(arr) || arr.length < 2)
          return {
            ok: false,
            message: "Co-run requires selecting two or more TaskIDs.",
          };
        return { ok: true };
      }
      case "slotRestriction": {
        const groups = config.groups || [];
        const min = Number(config.minCommonSlots);
        if (!Array.isArray(groups) || groups.length === 0)
          return { ok: false, message: "Select at least one group." };
        if (!Number.isFinite(min) || min < 0)
          return {
            ok: false,
            message: "Min Common Slots must be a non-negative number.",
          };
        return { ok: true };
      }
      case "loadLimit": {
        const groups = config.workerGroups || [];
        const maxS = Number(config.maxSlotsPerPhase);
        if (!Array.isArray(groups) || groups.length === 0)
          return { ok: false, message: "Select at least one worker group." };
        if (!Number.isFinite(maxS) || maxS < 0)
          return {
            ok: false,
            message: "Max Slots per Phase must be a non-negative number.",
          };
        return { ok: true };
      }
      case "phaseWindow": {
        const taskId = config.task;
        const phases = config.allowedPhases || [];
        if (!taskId) return { ok: false, message: "Select a Task." };
        if (!Array.isArray(phases) || phases.length === 0)
          return { ok: false, message: "Select one or more allowed phases." };
        return { ok: true };
      }
      case "patternMatch": {
        const ent = config.entity;
        const col = config.column;
        const pattern = config.pattern;
        if (!ent) return { ok: false, message: "Select a target entity." };
        if (!col) return { ok: false, message: "Select a target column." };
        if (!pattern) return { ok: false, message: "Enter a regex pattern." };
        try {
          // confirm valid regex
          // eslint-disable-next-line no-new
          new RegExp(pattern);
        } catch (e) {
          return { ok: false, message: "Regex pattern is invalid." };
        }
        return { ok: true };
      }
      case "precedenceOverride": {
        const order = config.ruleOrder || [];
        if (!Array.isArray(order) || order.length === 0)
          return { ok: false, message: "Provide an ordered list of rule IDs." };
        return { ok: true };
      }
      default:
        return { ok: true };
    }
  };

  // ---- Save handler ----
  const handleSave = () => {
    const v = validate();
    if (!v.ok) {
      // small in-modal alert approach: use window.alert for now
      window.alert(v.message);
      return;
    }
    const r: Rule = {
      id: editingRule?.id ?? uuidv4(),
      type,
      description: description || `${type} rule`,
      config,
    };
    if (editingRule) {
      updateRule(r.id, {
        type: r.type,
        description: r.description,
        config: r.config,
      });
    } else {
      addRule(r);
    }
    onClose();
  };

  // ---- Render config fields dynamically ----
  const renderConfigEditor = () => {
    switch (type) {
      case "coRun":
        return (
          <>
            <Label>Tasks (choose 2+)</Label>
            <MultiSelect
              options={taskOptions}
              selected={Array.isArray(config.tasks) ? config.tasks : []}
              onChange={(vals) => setConfig({ ...config, tasks: vals })}
              placeholder="Select Task IDs..."
            />
          </>
        );

      case "slotRestriction":
        return (
          <>
            <Label>Groups (Client or Worker groups)</Label>
            <MultiSelect
              options={[...clientGroups, ...workerGroups]}
              selected={Array.isArray(config.groups) ? config.groups : []}
              onChange={(vals) => setConfig({ ...config, groups: vals })}
              placeholder="Select groups..."
            />
            <Label className="mt-3">Min Common Slots</Label>
            <Input
              type="number"
              placeholder="e.g., 2"
              value={config.minCommonSlots ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  minCommonSlots:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </>
        );

      case "loadLimit":
        return (
          <>
            <Label>Worker Groups</Label>
            <MultiSelect
              options={workerGroups}
              selected={
                Array.isArray(config.workerGroups) ? config.workerGroups : []
              }
              onChange={(vals) => setConfig({ ...config, workerGroups: vals })}
              placeholder="Select worker groups..."
            />
            <Label className="mt-3">Max Slots Per Phase</Label>
            <Input
              type="number"
              value={config.maxSlotsPerPhase ?? ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxSlotsPerPhase:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </>
        );

      case "phaseWindow":
        return (
          <>
            <Label>Task</Label>
            <select
              className="w-full border rounded p-2"
              value={config.task ?? ""}
              onChange={(e) => setConfig({ ...config, task: e.target.value })}
            >
              <option value="">Select task...</option>
              {taskOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <Label className="mt-3">Allowed Phases</Label>
            <MultiSelect
              options={phaseOptions}
              selected={
                Array.isArray(config.allowedPhases) ? config.allowedPhases : []
              }
              onChange={(vals) => setConfig({ ...config, allowedPhases: vals })}
              placeholder="Select phases..."
            />
          </>
        );

      case "patternMatch":
        return (
          <>
            <Label>Target Entity</Label>
            <select
              className="w-full border rounded p-2"
              value={config.entity ?? "Clients"}
              onChange={(e) => {
                const ent = e.target.value as "Clients" | "Workers" | "Tasks";
                setConfig({ ...config, entity: ent, column: undefined });
              }}
            >
              <option value="Clients">Clients</option>
              <option value="Workers">Workers</option>
              <option value="Tasks">Tasks</option>
            </select>

            <Label className="mt-3">Target Column</Label>
            <select
              className="w-full border rounded p-2"
              value={config.column ?? ""}
              onChange={(e) => setConfig({ ...config, column: e.target.value })}
            >
              <option value="">Select column...</option>
              {(
                stringColumnsByEntity[
                  config.entity as keyof typeof stringColumnsByEntity
                ] || []
              ).map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <Label className="mt-3">Regex Pattern</Label>
            <Input
              value={config.pattern ?? ""}
              onChange={(e) =>
                setConfig({ ...config, pattern: e.target.value })
              }
              placeholder="e.g. ^TASK_[A-Z]+"
            />
          </>
        );

      case "precedenceOverride":
        return (
          <>
            <Label>Rule ordering (drag to reorder)</Label>
            <SortableList
              items={
                Array.isArray(config.ruleOrder) && config.ruleOrder.length
                  ? config.ruleOrder
                  : existingRuleItems.map((r) => r.value)
              }
              onChange={(newOrder) =>
                setConfig({ ...config, ruleOrder: newOrder })
              }
            />
            <p className="text-sm text-gray-500 mt-2">
              Order determines precedence (first = highest).
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Rule Type</Label>
            <select
              className="w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value as RuleType)}
            >
              <option value="coRun">Co-run</option>
              <option value="slotRestriction">Slot Restriction</option>
              <option value="loadLimit">Load Limit</option>
              <option value="phaseWindow">Phase Window</option>
              <option value="patternMatch">Pattern Match</option>
              <option value="precedenceOverride">Precedence Override</option>
            </select>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for this rule"
            />
          </div>

          <div>{renderConfigEditor()}</div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingRule ? "Update Rule" : "Add Rule"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
