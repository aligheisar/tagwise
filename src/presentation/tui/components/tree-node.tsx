import type { OperationState } from "#/hooks/use-operations";
import type { Operation } from "@/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "@/utils/is-operation";

type TreeNodeProps = {
  operation: OperationState;
  isSelected: boolean;
  depth: number;
};

function formatRenameOp(op: Operation): string {
  if (isRenameOperation(op)) {
    const oldName = op.oldPath.split("/").pop() ?? "";
    const newName = op.newPath.split("/").pop() ?? "";
    return `${oldName} → ${newName}`;
  }

  return "";
}

function formatTagUpdateOp(op: Operation): string {
  if (isTagUpdateOperation(op)) {
    const filename = op.path.split("/").pop() ?? "";
    const tagNames = Object.keys(op.tags).join(", ");
    return `${filename}  [${tagNames}]`;
  }

  return "";
}

function StatusIcon({ status }: { status: OperationState["status"] }) {
  switch (status) {
    case "accepted":
      return <span fg="#9ece6a">{" ✓ "}</span>;
    case "rejected":
      return <span fg="#f7768e">{" ✗ "}</span>;
    case "modified":
      return <span fg="#e0af68">{" ★ "}</span>;
  }
}

function OperationTypeBadge({ type }: { type: Operation["type"] }) {
  const color = type === "rename" ? "#7aa2f7" : "#bb9af7";
  const label = type === "rename" ? "rename" : "tag";
  return (
    <span bg="#1a1b26" fg={color}>
      {` ${label} `}
    </span>
  );
}

export function TreeNode({ operation, isSelected, depth }: TreeNodeProps) {
  const indent = "  ".repeat(depth);
  const bgColor = isSelected ? "#24283b" : undefined;
  const description =
    operation.operation.type === "rename"
      ? formatRenameOp(operation.operation)
      : formatTagUpdateOp(operation.operation);

  return (
    <box backgroundColor={bgColor} flexDirection="row" paddingX={1}>
      <text>
        <span fg="#565f89">{indent}</span>
        <StatusIcon status={operation.status} />
        <OperationTypeBadge type={operation.operation.type} />
        <span fg={operation.status === "rejected" ? "#565f89" : "#c0caf5"}>
          {` ${description}`}
        </span>
      </text>
    </box>
  );
}
