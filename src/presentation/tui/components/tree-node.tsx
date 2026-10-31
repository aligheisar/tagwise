import path from "node:path";
import type {
  FileOperationGroup,
  OperationStatus,
} from "#/lib/operations/operation-state";
import { colors } from "@/theme";

type TreeNodeProps = {
  group: FileOperationGroup;
  isSelected: boolean;
  depth: number;
};

function StatusIcon({ status }: { status: OperationStatus }) {
  switch (status) {
    case "accepted":
      return <span fg={colors.success}>{" ✓ "}</span>;
    case "rejected":
      return <span fg={colors.error}>{" ✗ "}</span>;
    case "modified":
      return <span fg={colors.warning}>{" ★ "}</span>;
  }
}

export function TreeNode({ group, isSelected, depth }: TreeNodeProps) {
  const indent = "  ".repeat(depth);
  const bgColor = isSelected ? colors.bgHighlight : undefined;
  const producerNames = [
    ...new Set(
      group.operations.map(
        ({ operation }) => operation.metadata?.producerName ?? operation.type,
      ),
    ),
  ];

  return (
    <box backgroundColor={bgColor} flexDirection="row" paddingX={1}>
      <text>
        <span fg={colors.muted}>{indent}</span>
        <StatusIcon status={group.status} />
        <span fg={colors.fgBright}>{path.basename(group.filePath)}</span>
        <span fg={colors.muted}>{`  ${producerNames.join(" · ")}`}</span>
        <span fg={colors.muted}>{`  (${group.operations.length})`}</span>
        <span
          fg={colors.accent}
        >{`  #${String(group.order + 1).padStart(3, "0")}`}</span>
      </text>
    </box>
  );
}
