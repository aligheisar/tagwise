import path from "node:path";
import { useKeyboard } from "@opentui/react";
import type { Operation } from "#/types/operation";
import { isRenameOperation, isTagUpdateOperation } from "#/utils/is-operation";
import type { OperationState } from "@/hooks/use-operations";
import { colors } from "@/theme";

type DetailModalProps = {
  operation: OperationState;
  onClose: () => void;
};

function RenameDetail({ op }: { op: Extract<Operation, { type: "rename" }> }) {
  const oldName = path.basename(op.oldPath);
  const newName = path.basename(op.newPath);
  const dir = path.dirname(op.oldPath);

  return (
    <box flexDirection="column" gap={1}>
      <text>
        <span fg={colors.muted}> Path: </span>
        <span fg={colors.fg}>{dir}/</span>
      </text>
      <text>
        <span fg={colors.muted}> From: </span>
        <span fg={colors.error}>{oldName}</span>
      </text>
      <text>
        <span fg={colors.muted}> To: </span>
        <span fg={colors.success}>{newName}</span>
      </text>
    </box>
  );
}

function TagUpdateDetail({
  op,
}: {
  op: Extract<Operation, { type: "tag-update" }>;
}) {
  const filename = path.basename(op.path);
  const dir = path.dirname(op.path);

  return (
    <box flexDirection="column" gap={1}>
      <text>
        <span fg={colors.muted}> Path: </span>
        <span fg={colors.fg}>
          {dir}/{filename}
        </span>
      </text>
      {Object.entries(op.tags).map(([key, value]) => (
        <text key={key}>
          <span fg={colors.muted}> Tag: </span>
          <span fg={colors.purple}>{key}</span>
          <span fg={colors.muted}> → </span>
          <span fg={colors.success}>{String(value)}</span>
        </text>
      ))}
    </box>
  );
}

export function DetailModal({ operation, onClose }: DetailModalProps) {
  useKeyboard((key) => {
    switch (key.name) {
      case "escape":
        onClose();
        break;
    }
  });

  const borderColor =
    operation.status === "accepted"
      ? colors.success
      : operation.status === "rejected"
        ? colors.error
        : colors.warning;

  return (
    <box
      backgroundColor={colors.bgDark}
      border
      borderColor={borderColor}
      flexDirection="column"
      height="70%"
      left="15%"
      padding={2}
      position="absolute"
      top="15%"
      width="70%"
      zIndex={50}
    >
      <text>
        <span fg={borderColor}>
          {"  ╔══════════════════════════════════════════╗"}
        </span>
      </text>
      <text>
        <span fg={borderColor}>{"  ║"}</span>
        <span fg={colors.fgBright}>
          {"          OPERATION DETAIL                 "}
        </span>
        <span fg={borderColor}>{"║"}</span>
      </text>
      <text>
        <span fg={borderColor}>
          {"  ╠══════════════════════════════════════════╣"}
        </span>
      </text>

      {isRenameOperation(operation.operation) ? (
        <RenameDetail op={operation.operation} />
      ) : isTagUpdateOperation(operation.operation) ? (
        <TagUpdateDetail op={operation.operation} />
      ) : null}

      <text>
        <span fg={borderColor}>
          {"  ╠══════════════════════════════════════════╣"}
        </span>
      </text>

      <text>
        <span fg={colors.muted}>{"  Esc: close"}</span>
      </text>
    </box>
  );
}
