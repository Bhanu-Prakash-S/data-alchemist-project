import { useRulesStore } from "@/store/useRulesStore";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Rule } from "@/types/rules";

export default function LoadLimitForm({ rule }: { rule: Rule }) {
  const { updateRule } = useRulesStore();

  return (
    <div className="space-y-2">
      <Select
        value={rule.workerGroup || ""}
        onValueChange={(val) => updateRule(rule.id, { workerGroup: val })}
      >
        <option value="">Select Worker Group</option>
        {/* dynamic groups here */}
      </Select>
      <Input
        type="number"
        placeholder="Max Slots per Phase"
        value={rule.maxSlotsPerPhase || ""}
        onChange={(e) =>
          updateRule(rule.id, { maxSlotsPerPhase: Number(e.target.value) })
        }
      />
    </div>
  );
}
