"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RulesTab from "./business-rules/RulesTab";
import PrioritizationTab from "./business-rules/PrioritizationTab";
import ExportFooter from "./business-rules/ExportFooter";

export default function BusinessRulesPanel() {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="rules" className="flex-1">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="prioritization">Prioritization</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="p-4">
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
