import { useKeyboard } from "@opentui/react";
import type { OperationState } from "#/hooks/use-operations";
import type { Operation } from "@/domain/operation/entity";

type DetailModalProps = {
  operation: OperationState;
  onClose: () => void;
};

function RenameDetail({ op }: { op: Extract<Operation, { type: "rename" }> }) {
  const oldName = op.oldPath.split("/").pop() ?? "";
  const newName = op.newPath.split("/").pop() ?? "";
  const dir = op.oldPath.split("/").slice(0, -1).join("/") || "/";

  return (
    <box flexDirection="column" gap={1}>
      <text>
        <span fg="#565f89"> Path: </span>
        <span fg="#a9b1d6">{dir}/</span>
      </text>
      <text>
        <span fg="#565f89"> From: </span>
        <span fg="#f7768e">{oldName}</span>
      </text>
      <text>
        <span fg="#565f89"> To: </span>
        <span fg="#9ece6a">{newName}</span>
      </text>
    </box>
  );
}

function TagUpdateDetail({
  op,
}: {
  op: Extract<Operation, { type: "tag-update" }>;
}) {
  const filename = op.path.split("/").pop() ?? "";
  const dir = op.path.split("/").slice(0, -1).join("/") || "/";

  return (
    <box flexDirection="column" gap={1}>
      <text>
        <span fg="#565f89"> Path: </span>
        <span fg="#a9b1d6">
          {dir}/{filename}
        </span>
      </text>
      {Object.entries(op.tags).map(([key, value]) => (
        <text key={key}>
          <span fg="#565f89"> Tag: </span>
          <span fg="#bb9af7">{key}</span>
          <span fg="#565f89"> → </span>
          <span fg="#9ece6a">{String(value)}</span>
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
      ? "#9ece6a"
      : operation.status === "rejected"
        ? "#f7768e"
        : "#e0af68";

  return (
    <box
      backgroundColor="#1a1a2e"
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
        <span fg="#c0caf5">
          {"          OPERATION DETAIL                 "}
        </span>
        <span fg={borderColor}>{"║"}</span>
      </text>
      <text>
        <span fg={borderColor}>
          {"  ╠══════════════════════════════════════════╣"}
        </span>
      </text>

      {operation.operation.type === "rename" ? (
        <RenameDetail op={operation.operation} />
      ) : (
        <TagUpdateDetail op={operation.operation} />
      )}

      <text>
        <span fg={borderColor}>
          {"  ╠══════════════════════════════════════════╣"}
        </span>
      </text>

      <text>
        <span fg="#565f89">{"  Esc: close"}</span>
      </text>
    </box>
  );
}
