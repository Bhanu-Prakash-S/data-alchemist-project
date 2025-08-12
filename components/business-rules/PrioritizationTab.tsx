"use client";

import React, { useMemo, useState } from "react";
import { useRulesStore } from "@/store/useRulesStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function PrioritizationTab() {
  const { priorities, setPriorities } = useRulesStore();
  const [selectedProfile, setSelectedProfile] = useState("");

  // Example criteria pulled dynamically from known system fields
  // These could be extended to be loaded from server/config file
  const criteriaList = useMemo(
    () => [
      "PriorityLevel",
      "RequestedTaskFulfillment",
      "Fairness",
      "WorkloadBalance",
      "DeadlineUrgency",
    ],
    []
  );

  const handleWeightChange = (criteria: string, value: number) => {
    setPriorities({ ...priorities, [criteria]: value });
  };

  const applyPreset = (preset: string) => {
    let newPriorities: Record<string, number> = {};
    switch (preset) {
      case "Maximize Fulfillment":
        newPriorities = {
          PriorityLevel: 90,
          RequestedTaskFulfillment: 100,
          Fairness: 40,
          WorkloadBalance: 50,
          DeadlineUrgency: 70,
        };
        break;
      case "Fair Distribution":
        newPriorities = {
          PriorityLevel: 60,
          RequestedTaskFulfillment: 60,
          Fairness: 100,
          WorkloadBalance: 80,
          DeadlineUrgency: 50,
        };
        break;
      case "Minimize Workload":
        newPriorities = {
          PriorityLevel: 50,
          RequestedTaskFulfillment: 40,
          Fairness: 70,
          WorkloadBalance: 100,
          DeadlineUrgency: 30,
        };
        break;
      default:
        return;
    }
    setPriorities(newPriorities);
    setSelectedProfile(preset);
  };

  return (
    <div className="space-y-6">
      {/* Preset Profiles */}
      <div>
        <Label>Preset Profiles</Label>
        <Select value={selectedProfile} onValueChange={applyPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a preset..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Maximize Fulfillment">
              Maximize Fulfillment
            </SelectItem>
            <SelectItem value="Fair Distribution">Fair Distribution</SelectItem>
            <SelectItem value="Minimize Workload">Minimize Workload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Sliders */}
      <div className="space-y-4">
        {criteriaList.map((criteria) => (
          <div key={criteria}>
            <div className="flex justify-between mb-1">
              <Label>{criteria}</Label>
              <span className="text-sm text-gray-500">
                {priorities[criteria] ?? 0}
              </span>
            </div>
            <Slider
              value={[priorities[criteria] ?? 0]}
              onValueChange={(val) => handleWeightChange(criteria, val[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        ))}
      </div>

      {/* Reset button */}
      <Button variant="secondary" onClick={() => setPriorities({})}>
        Reset Weights
      </Button>
    </div>
  );
}
