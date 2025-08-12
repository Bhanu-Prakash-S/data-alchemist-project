"use client";

import React, { useMemo, useState } from "react";
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
  editingRule?: Rule;
}

export default function RuleFormModal({
  open,
  onClose,
  editingRule,
}: RuleFormModalProps) {
  const { clients, workers, tasks } = useAppStore();
  const { addRule, updateRule } = useRulesStore();

  const [type, setType] = useState<RuleType>(editingRule?.type || "coRun");
  const [description, setDescription] = useState(
    editingRule?.description || ""
  );
  const [config, setConfig] = useState<any>(editingRule?.config || {});

  // Dynamic data sources
  const taskIDs = useMemo(
    () => tasks.map((t) => ({ label: t.TaskID, value: t.TaskID })),
    [tasks]
  );
  const clientGroups = useMemo(
    () =>
      Array.from(new Set(clients.map((c) => c.ClientGroup || "")))
        .filter(Boolean)
        .map((g) => ({ label: g, value: g })),
    [clients]
  );
  const workerGroups = useMemo(
    () =>
      Array.from(new Set(workers.map((w) => w.WorkerGroup || "")))
        .filter(Boolean)
        .map((g) => ({ label: g, value: g })),
    [workers]
  );
  const uniquePhases = useMemo(() => {
    const phases = new Set<string>();
    tasks.forEach((t) => {
      const raw = String(t.PreferredPhases || "");
      raw.split(/[, ]+/).forEach((p) => {
        if (p.trim()) phases.add(p.trim());
      });
    });
    return Array.from(phases)
      .sort()
      .map((p) => ({ label: p, value: p }));
  }, [tasks]);

  // Example meaningful columns for regex matching
  const regexTargetColumns = useMemo(
    () => ({
      Clients: ["Name", "Region"],
      Workers: ["Name", "Skill"],
      Tasks: ["Name", "Description"],
    }),
    []
  );

  const saveRule = () => {
    const rule: Rule = {
      id: editingRule?.id || uuidv4(),
      type,
      description,
      config,
    };
    if (editingRule) updateRule(rule.id, rule);
    else addRule(rule);
    onClose();
  };

  // Dynamic form renderer based on rule type
  const renderConfigFields = () => {
    switch (type) {
      case "coRun":
        return (
          <MultiSelect
            options={taskIDs}
            selected={config.tasks || []}
            onChange={(val) => setConfig({ ...config, tasks: val })}
            placeholder="Select Task IDs"
          />
        );
      case "slotRestriction":
        return (
          <>
            <Label>Group</Label>
            <MultiSelect
              options={[...clientGroups, ...workerGroups]}
              selected={config.groups || []}
              onChange={(val) => setConfig({ ...config, groups: val })}
              placeholder="Select Groups"
            />
            <Label className="mt-2">Min Common Slots</Label>
            <Input
              type="number"
              value={config.minCommonSlots || ""}
              onChange={(e) =>
                setConfig({ ...config, minCommonSlots: Number(e.target.value) })
              }
            />
          </>
        );
      case "loadLimit":
        return (
          <>
            <Label>Worker Group</Label>
            <MultiSelect
              options={workerGroups}
              selected={config.workerGroups || []}
              onChange={(val) => setConfig({ ...config, workerGroups: val })}
              placeholder="Select Worker Groups"
            />
            <Label className="mt-2">Max Slots Per Phase</Label>
            <Input
              type="number"
              value={config.maxSlotsPerPhase || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxSlotsPerPhase: Number(e.target.value),
                })
              }
            />
          </>
        );
      case "phaseWindow":
        return (
          <>
            <Label>Task</Label>
            <MultiSelect
              options={taskIDs}
              selected={config.task ? [config.task] : []}
              onChange={(val) => setConfig({ ...config, task: val[0] || "" })}
              placeholder="Select Task"
            />
            <Label className="mt-2">Allowed Phases</Label>
            <MultiSelect
              options={uniquePhases}
              selected={config.allowedPhases || []}
              onChange={(val) => setConfig({ ...config, allowedPhases: val })}
              placeholder="Select Phases"
            />
          </>
        );
      case "patternMatch":
        return (
          <>
            <Label>Target Entity</Label>
            <select
              className="border rounded p-2 w-full"
              value={config.entity || "Clients"}
              onChange={(e) => setConfig({ ...config, entity: e.target.value })}
            >
              {Object.keys(regexTargetColumns).map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
            <Label className="mt-2">Target Column</Label>
            <select
              className="border rounded p-2 w-full"
              value={config.column || ""}
              onChange={(e) => setConfig({ ...config, column: e.target.value })}
            >
              {(
                regexTargetColumns[
                  config.entity as keyof typeof regexTargetColumns
                ] || []
              ).map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <Label className="mt-2">Regex Pattern</Label>
            <Input
              value={config.pattern || ""}
              onChange={(e) =>
                setConfig({ ...config, pattern: e.target.value })
              }
            />
          </>
        );
      case "precedenceOverride":
        return (
          <>
            <Label>Rule Order</Label>
            <SortableList
              items={config.ruleOrder || []}
              onChange={(newOrder) =>
                setConfig({ ...config, ruleOrder: newOrder })
              }
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Rule Type</Label>
          <select
            className="border rounded p-2 w-full"
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

          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {renderConfigFields()}
        </div>

        <DialogFooter>
          <Button onClick={saveRule}>{editingRule ? "Update" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
