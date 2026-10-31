import { useKeyboard } from "@opentui/react";
import type { FileOperationGroup } from "#/lib/operations/operation-state";
import { getOperationChanges } from "@/lib/operation-changes";
import { colors } from "@/theme";

type DetailModalProps = {
  group: FileOperationGroup;
  onClose: () => void;
};

export function DetailModal({ group, onClose }: DetailModalProps) {
  useKeyboard((key) => {
    if (key.name === "escape") onClose();
  });

  const borderColor =
    group.status === "accepted"
      ? colors.success
      : group.status === "rejected"
        ? colors.error
        : colors.warning;
  const changes = getOperationChanges(group);

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
        <span fg={borderColor}>{"FILE CHANGES"}</span>
      </text>
      <text fg={colors.fgBright}>{group.filePath}</text>
      {changes.map((change) => (
        <box flexDirection="column" gap={1} key={change.id}>
          <text fg={colors.muted}>{change.producer}</text>
          <text>
            <span fg={colors.purple}>{`${change.field}: `}</span>
            <span fg={colors.error}>{change.before}</span>
            <span fg={colors.muted}> {">"} </span>
            <span fg={colors.success}>{change.after}</span>
          </text>
        </box>
      ))}
      <text fg={colors.muted}>Esc: close</text>
    </box>
  );
}
