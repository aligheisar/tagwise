import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import type { BorderStyle } from "@/components/ui/types";
import { useTheme } from "@/hooks/use-theme";

export interface ModalProps {
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  children?: ReactNode;
  closeHint?: string | false;
  height?: number | "auto" | `${number}%`;
  onClose?: () => void;
  open: boolean;
  paddingX?: number;
  paddingY?: number;
  title?: string;
  titleBorderStyle?: BorderStyle;
  width?: number | "auto" | `${number}%`;
}

export const Modal = ({
  open,
  onClose,
  title,
  width = 60,
  height = 60,
  children,
  borderStyle = "rounded",
  borderColor,
  backgroundColor,
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
      backgroundColor={backgroundColor}
      borderColor={resolvedBorderColor}
      borderStyle={borderStyle}
      flexDirection="column"
      height={height}
      justifyContent="space-between"
      paddingBottom={paddingY}
      paddingLeft={paddingX}
      paddingRight={paddingX}
      paddingTop={paddingY}
      width={width}
    >
      <box gap={1} paddingX={1}>
        {title && (
          <box
            borderColor={theme.colors.border}
            borderStyle={titleBorderStyle}
            paddingLeft={1}
            paddingRight={1}
          >
            <text fg={resolvedBorderColor}>
              <b>{title}</b>
            </text>
          </box>
        )}
        <box flexDirection="column">{children}</box>
      </box>
      {closeHint !== false && (
        <box marginTop={1}>
          <text fg="#666">{closeHint}</text>
        </box>
      )}
    </box>
  );
};
