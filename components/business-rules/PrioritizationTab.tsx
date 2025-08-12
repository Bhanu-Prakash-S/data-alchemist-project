"use client";

import { Slider } from "@/components/ui/slider";
import { useRulesStore } from "@/store/useRulesStore";

const CRITERIA = [
  "PriorityLevel",
  "RequestedTaskIDsFulfillment",
  "FairnessConstraints",
  "WorkloadBalance",
];

export default function PrioritizationTab() {
  const { priorities, setPriorities } = useRulesStore();

  const updatePriority = (key: string, value: number) => {
    setPriorities({
      ...priorities,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {CRITERIA.map((key) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between">
            <span>{key}</span>
            <span className="font-mono">{priorities[key] ?? 0}</span>
          </div>
          <Slider
            value={[priorities[key] ?? 0]}
            onValueChange={(val) => updatePriority(key, val[0])}
            min={0}
            max={10}
            step={1}
          />
        </div>
      ))}
    </div>
  );
}
