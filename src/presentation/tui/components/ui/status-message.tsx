import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/hooks/use-theme";

export type StatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "pending";

const ICONS: Record<Exclude<StatusVariant, "loading">, string> = {
  error: "✗",
  info: "ℹ",
  pending: "○",
  success: "✓",
  warning: "⚠",
};

export interface StatusMessageProps {
  children: ReactNode;
  icon?: string;
  variant?: StatusVariant;
}

export const StatusMessage = ({
  variant = "info",
  children,
  icon,
}: StatusMessageProps) => {
  const theme = useTheme();

  const variantColor = (() => {
    switch (variant) {
      case "success": {
        return theme.colors.success;
      }
      case "error": {
        return theme.colors.error;
      }
      case "warning": {
        return theme.colors.warning;
      }
      case "loading": {
        return theme.colors.primary;
      }
      case "pending": {
        return theme.colors.muted;
      }
      default: {
        return theme.colors.info;
      }
    }
  })();

  return (
    <box flexDirection="row" gap={1}>
      {variant === "loading" ? (
        <Spinner color={variantColor} name="dots" />
      ) : (
        <text fg={variantColor}>
          {icon ?? ICONS[variant as Exclude<StatusVariant, "loading">]}
        </text>
      )}
      {children}
    </box>
  );
};
