import { useRulesStore } from "@/store/useRulesStore";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Rule } from "@/types/rules";

export default function PatternMatchForm({ rule }: { rule: Rule }) {
  const { updateRule } = useRulesStore();

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Enter regex"
        value={rule.regex || ""}
        onChange={(e) => updateRule(rule.id, { regex: e.target.value })}
      />
      <Select
        value={rule.template || ""}
        onValueChange={(val) => updateRule(rule.id, { template: val })}
      >
        <option value="">Select Template</option>
        <option value="templateA">Template A</option>
        <option value="templateB">Template B</option>
      </Select>
    </div>
  );
}
