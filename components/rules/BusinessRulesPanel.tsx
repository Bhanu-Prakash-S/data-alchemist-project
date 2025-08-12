"use client";
import React from "react";
import { useRulesStore } from "@/store/useRulesStore";
import { Rule, RuleType } from "@/types/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Download } from "lucide-react";

export default function BusinessRulesPanel() {
  const {
    rules,
    weights,
    addRule,
    updateRule,
    removeRule,
    setWeights,
    exportRulesConfig,
  } = useRulesStore();

  // Simple rule type options — can expand later
  const ruleTypes: RuleType[] = [
    "coRun",
    "slotRestriction",
    "loadLimit",
    "phaseWindow",
    "patternMatch",
    "precedenceOverride",
  ];

  /** Add blank rule for demo purposes */
  const handleAddRule = () => {
    addRule({
      type: "coRun",
      tasks: [],
    } as any); // actual types handled in form
  };

  /** Export rules.json */
  const handleExport = () => {
    const config = exportRulesConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rules.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* RULES LIST */}
      <section className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Business Rules</h2>
          <Button onClick={handleAddRule}>Add Rule</Button>
        </div>

        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground">No rules added yet.</p>
          )}
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <select
                  value={rule.type}
                  onChange={(e) =>
                    updateRule(rule.id, { type: e.target.value as RuleType })
                  }
                  className="border p-1 rounded"
                >
                  {ruleTypes.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Rule details (JSON or UI fields)"
                  value={JSON.stringify(rule)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateRule(rule.id, parsed);
                    } catch {
                      // ignore invalid JSON until fixed
                    }
                  }}
                />
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* WEIGHTS PANEL */}
      <section className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Prioritization & Weights</h2>
        {Object.keys(weights.weights || {}).map((criteria) => (
          <div key={criteria} className="mb-4">
            <label className="text-sm font-medium mb-1 block">{criteria}</label>
            <Slider
              value={[weights.weights[criteria]]}
              min={0}
              max={10}
              step={1}
              onValueChange={(val) =>
                setWeights({
                  ...weights,
                  weights: { ...weights.weights, [criteria]: val[0] },
                })
              }
            />
          </div>
        ))}
        {/* Add default sliders for demo */}
        {Object.keys(weights.weights).length === 0 && (
          <>
            {["PriorityLevel", "RequestedTaskIDs", "Fairness"].map(
              (criteria) => (
                <div key={criteria} className="mb-4">
                  <label className="text-sm font-medium mb-1 block">
                    {criteria}
                  </label>
                  <Slider
                    defaultValue={[5]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={(val) =>
                      setWeights({
                        ...weights,
                        weights: { ...weights.weights, [criteria]: val[0] },
                      })
                    }
                  />
                </div>
              )
            )}
          </>
        )}
      </section>

      {/* EXPORT BUTTON */}
      <div className="pt-2 border-t">
        <Button onClick={handleExport} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Export rules.json
        </Button>
      </div>
    </div>
  );
}
