import path from "node:path";
import type { FileOperationGroup } from "#/lib/operations/operation-state";

type OperationChange = {
  after: string;
  before: string;
  field: string;
  id: string;
  producer: string;
};

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "(empty)";
  return Array.isArray(value) ? value.join(", ") || "(empty)" : String(value);
}

function getPreviousTags(
  operation: FileOperationGroup["operations"][number]["operation"],
): Record<string, unknown> {
  const previousTags = operation.metadata?.previousTags;
  if (typeof previousTags !== "object" || previousTags === null) return {};
  return previousTags as Record<string, unknown>;
}

function getOperationChanges(group: FileOperationGroup): OperationChange[] {
  return group.operations.flatMap(({ id, modifiedValue, operation }) => {
    const producer = String(operation.metadata?.producerName ?? operation.type);

    if (operation.type === "rename") {
      const newPath =
        modifiedValue && "newPath" in modifiedValue
          ? (modifiedValue.newPath ?? operation.newPath)
          : operation.newPath;
      const before = path.basename(operation.oldPath);
      const after = path.basename(newPath);
      return before === after
        ? []
        : [{ after, before, field: "Name", id, producer }];
    }

    if (operation.type !== "tag-update") return [];

    const tags =
      modifiedValue && "tags" in modifiedValue
        ? (modifiedValue.tags ?? operation.tags)
        : operation.tags;
    const previousTags = getPreviousTags(operation);

    return Object.entries(tags).flatMap(([field, nextValue]) => {
      const before = displayValue(previousTags[field]);
      const after = displayValue(nextValue);
      return before === after
        ? []
        : [{ after, before, field, id: `${id}:${field}`, producer }];
    });
  });
}

export type { OperationChange };
export { getOperationChanges };
