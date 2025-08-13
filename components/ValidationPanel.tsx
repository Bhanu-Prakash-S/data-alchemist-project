"use client";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { EntityType, ValidationIssue } from "@/lib/validationEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ValidationPanel() {
  const runAllValidators = useAppStore((state) => state.runAllValidators);
  const applyQuickFix = useAppStore((state) => state.applyQuickFix);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const validationIssues = useAppStore(
    (state) => state.validationIssues
  ) as ValidationIssue[];

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
    setActiveView(issue.entity as EntityType);
    setTimeout(() => {
      const fn = (window as any).__dataAlch_navigateToIssue;
      if (typeof fn === "function") fn(issue);
    }, 120);
  };

  const getIssueStyles = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-500 bg-red-50";
      case "warning":
        return "border-amber-600 bg-amber-100";
      default:
        return "border-gray-500 bg-gray-200";
    }
  };

  return (
    <div className="w-full h-full flex flex-col shadow-lg z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Validation Issues</h3>
          <Badge
            variant="secondary"
            className="bg-red-200 text-red-700 text-xs px-2 py-1 rounded-lg"
          >
            {validationIssues.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-2 p-1">
          <Button size="sm" variant="default" onClick={runAllValidators}>
            Re-run
          </Button>
        </div>
      </div>

      <div className="flex h-full bg-gray-50 overflow-hidden">
        {/* Clients Section */}
        <div className="flex-1 flex flex-col border-gray-400">
          <div className="flex items-center justify-between px-4 py-1 border-b bg-gray-25">
            <h4 className="text-sm font-medium">Clients</h4>
            <Badge
              variant="outline"
              className="text-xs bg-red-200 text-red-700"
            >
              {byEntity.Clients.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {byEntity.Clients.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 px-2">
                No issues
              </div>
            ) : (
              <div className="space-y-2">
                {byEntity.Clients.map((issue: ValidationIssue) => (
                  <div
                    key={issue.id}
                    className={`p-2 border-2 rounded text-xs hover:shadow-sm cursor-pointer ${getIssueStyles(
                      issue.type
                    )}`}
                    onClick={() => onClickIssue(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {issue.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.column ? `${issue.column} · ` : ""}
                          {issue.rowId ?? `row ${issue.rowIndex}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        <div className="text-xs text-muted-foreground">
                          {issue.type}
                        </div>
                        {issue.fixable && (
                          <Button
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyQuickFix(issue.id);
                            }}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* Workers Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-1 border-b bg-gray-25">
            <h4 className="text-sm font-medium">Workers</h4>
            <Badge
              variant="outline"
              className="text-xs bg-red-200 text-red-700"
            >
              {byEntity.Workers.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {byEntity.Workers.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 px-2">
                No issues
              </div>
            ) : (
              <div className="space-y-2">
                {byEntity.Workers.map((issue: ValidationIssue) => (
                  <div
                    key={issue.id}
                    className={`p-2 border-2 rounded text-xs hover:shadow-sm cursor-pointer ${getIssueStyles(
                      issue.type
                    )}`}
                    onClick={() => onClickIssue(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {issue.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.column ? `${issue.column} · ` : ""}
                          {issue.rowId ?? `row ${issue.rowIndex}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        <div className="text-xs text-muted-foreground">
                          {issue.type}
                        </div>
                        {issue.fixable && (
                          <Button
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyQuickFix(issue.id);
                            }}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* Tasks Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-1 border-b bg-gray-25">
            <h4 className="text-sm font-medium">Tasks</h4>
            <Badge
              variant="outline"
              className="text-xs bg-red-200 text-red-700"
            >
              {byEntity.Tasks.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {byEntity.Tasks.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 px-2">
                No issues
              </div>
            ) : (
              <div className="space-y-2">
                {byEntity.Tasks.map((issue: ValidationIssue) => (
                  <div
                    key={issue.id}
                    className="p-2 border rounded text-xs hover:shadow-sm cursor-pointer bg-white"
                    onClick={() => onClickIssue(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {issue.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.column ? `${issue.column} · ` : ""}
                          {issue.rowId ?? `row ${issue.rowIndex}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        <div className="text-xs text-muted-foreground">
                          {issue.type}
                        </div>
                        {issue.fixable && (
                          <Button
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyQuickFix(issue.id);
                            }}
                          >
                            Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
