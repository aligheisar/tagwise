import type { BoxProps as OpenTuiBoxProps } from "@opentui/react";
import type { BorderStyle } from "@/components/ui/types";
import { useTheme } from "@/hooks/use-theme";

export type BorderVariant =
  | "default"
  | "muted"
  | "focus"
  | "success"
  | "error"
  | "warning";

export type BoxProps = Omit<
  OpenTuiBoxProps,
  "border" | "borderColor" | "borderStyle" | "children"
> & {
  border?: boolean;
  borderVariant?: BorderVariant;
  borderColor?: string;
  borderStyle?: BorderStyle;
  children?: OpenTuiBoxProps["children"];
};

export const Box = ({
  border,
  borderVariant = "default",
  borderColor,
  children,
  borderStyle,
  flexDirection = "row",
  ...props
}: BoxProps) => {
  const theme = useTheme();

  const resolvedBorderColor =
    borderColor ??
    (() => {
      switch (borderVariant) {
        case "focus": {
          return theme.colors.focusRing;
        }
        case "success": {
          return theme.colors.success;
        }
        case "error": {
          return theme.colors.error;
        }
        case "warning": {
          return theme.colors.warning;
        }
        case "muted": {
          return theme.colors.mutedForeground;
        }
        default: {
          return theme.colors.border;
        }
      }
    })();

  return (
    <box
      border={border}
      borderColor={border ? resolvedBorderColor : undefined}
      borderStyle={border ? (borderStyle ?? theme.border.style) : undefined}
      flexDirection={flexDirection}
      {...props}
    >
      {children}
    </box>
  );
};
