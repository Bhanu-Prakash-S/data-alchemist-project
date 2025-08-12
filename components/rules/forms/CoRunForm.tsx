// /components/rules/forms/CoRunForm.tsx
import { useRulesStore } from "@/store/useRulesStore";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Rule } from "@/types/rules";
import { useAppStore } from "@/store/useAppStore";

export default function CoRunForm({ rule }: { rule: Rule }) {
  const { updateRule } = useRulesStore();
  const { tasks } = useAppStore();

  const taskOptions = tasks.map((t) => ({
    label: t.TaskID,
    value: t.TaskID,
  }));

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Select Task IDs</label>
      <MultiSelect
        options={taskOptions}
        selected={rule.tasks || []}
        onChange={(val) => updateRule(rule.id, { tasks: val })}
      />
    </div>
  );
}
