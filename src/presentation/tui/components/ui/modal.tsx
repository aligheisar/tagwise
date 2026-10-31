import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import type { BorderStyle } from "@/components/ui/types";
import { useTheme } from "@/hooks/use-theme";

export interface ModalProps {
  borderColor?: string;
  borderStyle?: BorderStyle;
  children?: ReactNode;
  closeHint?: string | false;
  onClose?: () => void;
  open: boolean;
  paddingX?: number;
  paddingY?: number;
  title?: string;
  titleBorderStyle?: BorderStyle;
  width?: number;
}

export const Modal = ({
  open,
  onClose,
  title,
  width = 60,
  children,
  borderStyle = "rounded",
  borderColor,
  paddingX = 1,
  paddingY = 0,
  titleBorderStyle = "single",
  closeHint = "Press Esc to close",
}: ModalProps) => {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.primary;

  useKeyboard((key) => {
    if (!open) {
      return;
    }
    if (key.name === "escape") {
      onClose?.();
    }
  });

  if (!open) {
    return null;
  }

  return (
    <box
      borderColor={resolvedBorderColor}
      borderStyle={borderStyle}
      flexDirection="column"
      paddingBottom={paddingY}
      paddingLeft={paddingX}
      paddingRight={paddingX}
      paddingTop={paddingY}
      width={width}
    >
      {title && (
        <box
          borderColor={theme.colors.border}
          borderStyle={titleBorderStyle}
          marginBottom={1}
          paddingLeft={1}
          paddingRight={1}
        >
          <text fg={resolvedBorderColor}>
            <b>{title}</b>
          </text>
        </box>
      )}
      <box flexDirection="column">{children}</box>
      {closeHint !== false && (
        <box marginTop={1}>
          <text fg="#666">{closeHint}</text>
        </box>
      )}
    </box>
  );
};
