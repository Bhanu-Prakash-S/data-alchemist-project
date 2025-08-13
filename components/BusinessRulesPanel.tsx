"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RulesTab from "./business-rules/RulesTab";
import PrioritizationTab from "./business-rules/PrioritizationTab";
import ExportFooter from "./business-rules/ExportFooter";

export default function BusinessRulesPanel() {
  return (
    <div className="bg-zinc-200 flex flex-col h-full">
      <Tabs defaultValue="rules" className="flex-1 p-4">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="prioritization">Prioritization</TabsTrigger>
        </TabsList>
        <TabsContent
          value="rules"
          className="p-4 border-2 border-slate-700 rounded-lg bg-zinc-100"
        >
          <RulesTab />
        </TabsContent>
        <TabsContent value="prioritization" className="p-4">
          <PrioritizationTab />
        </TabsContent>
      </Tabs>
      <ExportFooter />
    </div>
  );
}
