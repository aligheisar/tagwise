import path from "node:path";
import type { Operation } from "#/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "#/utils/is-operation";
import type { OperationState } from "@/hooks/use-operations";
import { colors } from "@/theme";

type TreeNodeProps = {
  operation: OperationState;
  isSelected: boolean;
  depth: number;
};

function formatRenameOp(op: Operation): string {
  if (isRenameOperation(op)) {
    const oldName = path.basename(op.oldPath);
    const newName = path.basename(op.newPath);
    return `${oldName} → ${newName}`;
  }

  return "";
}

function formatTagUpdateOp(op: Operation): string {
  if (isTagUpdateOperation(op)) {
    const filename = path.basename(op.path);
    const tagNames = Object.keys(op.tags).join(", ");
    return `${filename}  [${tagNames}]`;
  }

  return "";
}

function StatusIcon({ status }: { status: OperationState["status"] }) {
  switch (status) {
    case "accepted":
      return <span fg={colors.success}>{" ✓ "}</span>;
    case "rejected":
      return <span fg={colors.error}>{" ✗ "}</span>;
    case "modified":
      return <span fg={colors.warning}>{" ★ "}</span>;
  }
}

function OperationTypeBadge({ type }: { type: Operation["type"] }) {
  const color = type === "rename" ? colors.accent : colors.purple;
  const label = type === "rename" ? "rename" : "tag";
  return (
    <span bg={colors.bg} fg={color}>
      {` ${label} `}
    </span>
  );
}

export function TreeNode({ operation, isSelected, depth }: TreeNodeProps) {
  const indent = "  ".repeat(depth);
  const bgColor = isSelected ? colors.bgHighlight : undefined;
  const description =
    operation.operation.type === "rename"
      ? formatRenameOp(operation.operation)
      : formatTagUpdateOp(operation.operation);

  return (
    <box backgroundColor={bgColor} flexDirection="row" paddingX={1}>
      <text>
        <span fg={colors.muted}>{indent}</span>
        <StatusIcon status={operation.status} />
        <OperationTypeBadge type={operation.operation.type} />
        <span
          fg={operation.status === "rejected" ? colors.muted : colors.fgBright}
        >
          {` ${description}`}
        </span>
      </text>
    </box>
  );
}
