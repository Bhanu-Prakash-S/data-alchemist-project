"use client";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { ValidationIssue, EntityType } from "@/lib/validationEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ValidationPanel() {
  // ✅ Individually subscribe to each slice to avoid recreating object every render
  const validationPanelOpen = useAppStore((state) => state.validationPanelOpen);
  const toggleValidationPanel = useAppStore(
    (state) => state.toggleValidationPanel
  );
  const validationIssues = useAppStore(
    (state) => state.validationIssues
  ) as ValidationIssue[];
  const runAllValidators = useAppStore((state) => state.runAllValidators);
  const applyQuickFix = useAppStore((state) => state.applyQuickFix);
  const setActiveEntity = useAppStore((state) => state.setActiveEntity);

  // Group by entity
  const byEntity: Record<EntityType, ValidationIssue[]> =
    validationIssues.reduce(
      (acc: Record<EntityType, ValidationIssue[]>, cur: ValidationIssue) => {
        if (!acc[cur.entity]) {
          acc[cur.entity] = [];
        }
        acc[cur.entity].push(cur);
        return acc;
      },
      { Clients: [], Workers: [], Tasks: [] }
    );

  // Navigate to issue
  const onClickIssue = (issue: ValidationIssue) => {
    setActiveEntity(issue.entity as EntityType);
    setTimeout(() => {
      const fn = (window as any).__dataAlch_navigateToIssue;
      if (typeof fn === "function") fn(issue);
    }, 120);
  };

  return (
    <>
      {/* Backdrop overlay */}
      {validationPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => toggleValidationPanel(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-lg border-l shadow-lg transform transition-transform z-50 bg-white pointer-events-auto ${
          validationPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div>
            <h3 className="text-lg font-semibold">Validation Issues</h3>
            <p className="text-sm text-muted-foreground">
              {validationIssues.length} issue(s)
            </p>
          </div>
          <div className="space-x-2">
            <Button size="sm" onClick={() => runAllValidators()}>
              Re-run
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleValidationPanel(false)}
            >
              Close
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-auto h-[calc(100%-88px)]">
          {validationIssues.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No issues found.
            </div>
          )}
          {Object.entries(byEntity).map(([entity, issues]) => (
            <div key={entity} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{entity}</h4>
                <Badge>{issues.length}</Badge>
              </div>
              <div className="space-y-2">
                {issues.map((iss: ValidationIssue) => (
                  <div
                    key={iss.id}
                    className="p-2 border rounded hover:shadow-sm cursor-pointer"
                    onClick={() => onClickIssue(iss)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{iss.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {iss.column ? `${iss.column} · ` : ""}
                          {iss.rowId ?? `row ${iss.rowIndex}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-xs">{iss.type}</div>
                        {iss.fixable && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyQuickFix(iss.id);
                            }}
                          >
                            Quick Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
