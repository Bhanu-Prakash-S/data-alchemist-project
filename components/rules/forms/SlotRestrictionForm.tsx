import { useRulesStore } from "@/store/useRulesStore";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Rule } from "@/types/rules";

export default function SlotRestrictionForm({ rule }: { rule: Rule }) {
  const { updateRule } = useRulesStore();

  return (
    <div className="space-y-2">
      <Select
        value={rule.group || ""}
        onValueChange={(val) => updateRule(rule.id, { group: val })}
      >
        <option value="">Select Group</option>
        <option value="ClientGroup">Client Group</option>
        <option value="WorkerGroup">Worker Group</option>
      </Select>
      <Input
        type="number"
        placeholder="Min Common Slots"
        value={rule.minCommonSlots || ""}
        onChange={(e) =>
          updateRule(rule.id, { minCommonSlots: Number(e.target.value) })
        }
      />
    </div>
  );
}
