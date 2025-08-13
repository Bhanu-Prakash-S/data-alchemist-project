"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { SortableList } from "@/components/ui/SortableList";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useRulesStore, RuleType, Rule } from "@/store/useRulesStore";
import { useAppStore } from "@/store/useAppStore";
import { parseNumberList } from "@/lib/normalize";

type EntityName = "Clients" | "Workers" | "Tasks";

interface RuleFormModalProps {
  open: boolean;
  onClose: () => void;
  editRule?: Rule | null;
}

export default function RuleFormModal({
  open,
  onClose,
  editRule,
}: RuleFormModalProps) {
  const { addRule, updateRule } = useRulesStore();
  const { clients, workers, tasks } = useAppStore();

  // --------------------------
  // Local form state
  // --------------------------
  const [type, setType] = useState<RuleType>("coRun");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<any>({});

  // --------------------------
  // Derived options
  // --------------------------
  const taskOptions = useMemo(
    () =>
      (tasks || []).map((t: any) => ({
        label: String(t.TaskID ?? ""),
        value: String(t.TaskID ?? ""),
      })),
    [tasks]
  );

  const entityOptions: { label: EntityName; value: EntityName }[] = [
    { label: "Clients", value: "Clients" },
    { label: "Workers", value: "Workers" },
    { label: "Tasks", value: "Tasks" },
  ];

  const getColumnOptions = (
    entity: EntityName
  ): { label: string; value: string }[] => {
    const rows =
      entity === "Clients" ? clients : entity === "Workers" ? workers : tasks;
    if (!rows || !rows.length) return [];
    return Object.keys(rows[0]).map((col) => ({ label: col, value: col }));
  };

  // Extract unique phases from Tasks.PreferredPhases using parseNumberList
  const phaseOptions = useMemo(() => {
    const set = new Set<number>();
    (tasks || []).forEach((t: any) => {
      const v = t?.PreferredPhases;
      if (v == null || v === "") return;
      const parsed = parseNumberList(v);
      if (parsed.ok) {
        parsed.arr.forEach((n) => {
          if (Number.isFinite(n)) set.add(Number(n));
        });
      }
    });
    const sorted = Array.from(set).sort((a, b) => a - b);
    return sorted.map((n) => ({ label: String(n), value: String(n) }));
  }, [tasks]);

  // --------------------------
  // Hydrate on open / edit
  // --------------------------
  useEffect(() => {
    if (open) {
      if (editRule) {
        setType(editRule.type);
        setDescription(editRule.description || "");
        setConfig(editRule.config || {});
      } else {
        setType("coRun");
        setDescription("");
        setConfig({});
      }
    }
  }, [open, editRule]);

  // --------------------------
  // Save
  // --------------------------
  const save = () => {
    const v = validate();
    if (!v.ok) {
      // small in-modal alert approach: use window.alert for now
      window.alert(v.message);
      return;
    }

    const payload: Partial<Rule> = {
      type,
      description,
      config,
    };

    if (editRule) {
      // Update existing
      updateRule(editRule.id, payload);
    } else {
      // Create new
      const newRule: Rule = {
        id: uuidv4(),
        type,
        description,
        config,
      };
      addRule(newRule);
    }
    onClose();
  };

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

      default:
        return { ok: true };
    }
  };
  // --------------------------
  // UI blocks per rule type
  // --------------------------

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

  // coRun: { tasks: string[] }
  const CoRunBlock = (
    <div className="space-y-2">
      <Label>Tasks (select 2 or more)</Label>
      <MultiSelect
        options={taskOptions}
        selected={(config.tasks as string[]) || []}
        onChange={(vals) => setConfig({ ...config, tasks: vals })}
        placeholder="Select tasks..."
      />
    </div>
  );

  // slotRestriction: { scope: "Clients" | "Workers"; groupIds: string[]; minCommonSlots: number }
  const SlotRestrictionBlock = (
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
            minCommonSlots: e.target.value === "" ? "" : Number(e.target.value),
          })
        }
      />
    </>
  );

  // loadLimit: { workerIds: string[]; maxSlotsPerPhase: number }
  const LoadLimitBlock = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Worker Group</Label>
        <MultiSelect
          options={workerGroups}
          selected={config.workerGroups || []}
          onChange={(val) => setConfig({ ...config, workerGroups: val })}
          placeholder="Select Worker Groups"
        />
      </div>

      <div className="space-y-2">
        <Label>Max Slots Per Phase</Label>
        <Input
          type="number"
          value={config.maxSlotsPerPhase ?? ""}
          onChange={(e) =>
            setConfig({
              ...config,
              maxSlotsPerPhase: Number(e.target.value || 0),
            })
          }
          placeholder="e.g., 3"
        />
      </div>
    </div>
  );

  // phaseWindow: { taskId: string; allowedPhases: string[] }
  const PhaseWindowBlock = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Task</Label>
        <Select
          value={config.task || ""}
          onValueChange={(val) => setConfig({ ...config, task: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select task" />
          </SelectTrigger>
          <SelectContent>
            {taskOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Allowed Phases</Label>
        <MultiSelect
          options={phaseOptions}
          selected={(config.allowedPhases as string[]) || []}
          onChange={(vals) => setConfig({ ...config, allowedPhases: vals })}
          placeholder="Pick allowed phases..."
        />
      </div>
    </div>
  );

  // patternMatch: { entity: EntityName; column: string; pattern: string }
  const PatternMatchBlock = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Target Entity</Label>
        <Select
          value={config.entity || ""}
          onValueChange={(val) =>
            setConfig({
              ...config,
              entity: val as EntityName,
              column: "", // reset column when entity changes
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            {entityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.entity && (
        <div className="space-y-2">
          <Label>Target Column</Label>
          <Select
            value={config.column || ""}
            onValueChange={(val) => setConfig({ ...config, column: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {getColumnOptions(config.entity).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Regex Pattern</Label>
        <Input
          value={config.pattern || ""}
          onChange={(e) => setConfig({ ...config, pattern: e.target.value })}
          placeholder="e.g., ^A.* or \\d{3}-\\d{2}"
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>

        {/* Rule Type (Shadcn Select) */}
        <div className="space-y-2">
          <Label>Rule Type</Label>
          <Select
            value={type}
            onValueChange={(val) => setType(val as RuleType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coRun">Co-Run</SelectItem>
              <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
              <SelectItem value="loadLimit">Load Limit</SelectItem>
              <SelectItem value="phaseWindow">Phase Window</SelectItem>
              <SelectItem value="patternMatch">Pattern Match</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this rule"
          />
        </div>

        {/* Dynamic config by type */}
        {type === "coRun" && CoRunBlock}
        {type === "slotRestriction" && SlotRestrictionBlock}
        {type === "loadLimit" && LoadLimitBlock}
        {type === "phaseWindow" && PhaseWindowBlock}
        {type === "patternMatch" && PatternMatchBlock}

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
