import type { FileOperationGroup } from "#/lib/operations/operation-state";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/hooks/use-theme";
import { getOperationChanges } from "@/lib/operation-changes";

type DetailModalProps = {
  group: FileOperationGroup;
  onClose: () => void;
};

export function DetailModal({ group, onClose }: DetailModalProps) {
  const { colors } = useTheme();
  const borderColor =
    group.status === "accepted"
      ? colors.success
      : group.status === "rejected"
        ? colors.error
        : colors.warning;
  const changes = getOperationChanges(group);

  return (
    <box
      height="70%"
      left="15%"
      position="absolute"
      top="15%"
      width="70%"
      zIndex={50}
    >
      <Modal
        backgroundColor={colors.background}
        borderColor={borderColor}
        height="100%"
        onClose={onClose}
        open
        title="FILE CHANGES"
        width="100%"
      >
        <box gap={1}>
          <text fg={colors.foreground}>{group.filePath}</text>
          <box gap={1}>
            {changes.map((change) => (
              <box flexDirection="column" gap={0} key={change.id}>
                <text fg={colors.muted}>{change.producer}</text>
                <text>
                  <span fg={colors.accent}>{`${change.field}: `}</span>
                  <span fg={colors.error}>{change.before}</span>
                  <span fg={colors.muted}> {">"} </span>
                  <span fg={colors.success}>{change.after}</span>
                </text>
              </box>
            ))}
          </box>
        </box>
      </Modal>
    </box>
  );
}
