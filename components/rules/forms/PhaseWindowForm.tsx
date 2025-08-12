import { useRulesStore } from "@/store/useRulesStore";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Rule } from "@/types/rules";
import { useAppStore } from "@/store/useAppStore";

export default function PhaseWindowForm({ rule }: { rule: Rule }) {
  const { updateRule } = useRulesStore();
  const { tasks } = useAppStore();

  const taskOptions = tasks.map((t) => ({
    label: t.TaskID,
    value: t.TaskID,
  }));

  const phaseOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`,
  }));

  return (
    <div className="space-y-2">
      <Select
        value={rule.taskId || ""}
        onValueChange={(val) => updateRule(rule.id, { taskId: val })}
      >
        <option value="">Select Task</option>
        {taskOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <MultiSelect
        options={phaseOptions}
        selected={rule.allowedPhases || []}
        onChange={(val) => updateRule(rule.id, { allowedPhases: val })}
      />
    </div>
  );
}
