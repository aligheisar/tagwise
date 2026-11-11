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
  if (!Array.isArray(value)) return String(value);

  const formatted = value.join(", ");
  if (!formatted) return "(empty)";
  return value.length > 1 ? `[${formatted}]` : formatted;
}

function sameTagValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    return (
      left.length === right.length &&
      left.every((value, index) => sameTagValue(value, right[index]))
    );
  }
  return Object.is(left, right);
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
    const producer = String(operation.producedBy);

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
      const previousValue = previousTags[field];
      if (sameTagValue(previousValue, nextValue)) return [];

      const before = displayValue(previousValue);
      const after = displayValue(nextValue);
      return [{ after, before, field, id: `${id}:${field}`, producer }];
    });
  });
}

export type { OperationChange };
export { getOperationChanges };
