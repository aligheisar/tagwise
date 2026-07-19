import type { ReactNode } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import type { BorderStyle } from "@/components/ui/types";

export type BorderVariant =
  | "default"
  | "muted"
  | "focus"
  | "success"
  | "error"
  | "warning";

export interface BoxProps {
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  border?: boolean;
  borderColor?: string;
  borderStyle?: BorderStyle;
  borderVariant?: BorderVariant;
  children?: ReactNode;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexGrow?: number;
  flexShrink?: number;
  gap?: number;
  height?: number | string;
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  minHeight?: number;
  minWidth?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  width?: number | string;
  [key: string]: unknown;
}

export const Box = ({
  border,
  borderVariant = "default",
  borderColor,
  children,
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
      borderColor={border ? resolvedBorderColor : undefined}
      borderStyle={
        border ? (props.borderStyle ?? theme.border.style) : undefined
      }
    >
      {children}
    </box>
  );
};
