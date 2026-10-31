import { useKeyboard } from "@opentui/react";
import type { ReactNode } from "react";
import { useState } from "react";

import { useTheme } from "@/hooks/use-theme";

export type BannerVariant =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral";

const ICONS: Record<BannerVariant, string> = {
  error: "✗",
  info: "ℹ",
  neutral: "·",
  success: "✓",
  warning: "⚠",
};

export interface BannerProps {
  accentChar?: string;
  children: ReactNode;
  color?: string;
  dismissible?: boolean;
  gap?: number;
  hideIcon?: boolean;
  icon?: string;
  onDismiss?: () => void;
  title?: string;
  variant?: BannerVariant;
}

export const Banner = ({
  children,
  variant = "info",
  icon,
  hideIcon = false,
  title,
  dismissible = false,
  onDismiss,
  color,
  accentChar = "┃",
  gap = 1,
}: BannerProps) => {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);

  const variantColor =
    color ??
    (() => {
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
        case "neutral": {
          return theme.colors.foreground;
        }
        default: {
          return theme.colors.info;
        }
      }
    })();

  useKeyboard((key) => {
    if (dismissible && key.name === "escape") {
      setDismissed(true);
      onDismiss?.();
    }
  });

  if (dismissed) {
    return null;
  }

  const resolvedIcon = icon ?? ICONS[variant];

  return (
    <box flexDirection="column">
      <box flexDirection="row" gap={gap}>
        <text fg={variantColor}>{accentChar}</text>
        <box flexDirection="column">
          <box flexDirection="row" gap={1}>
            {!hideIcon && <text fg={variantColor}>{resolvedIcon}</text>}
            {title && (
              <text fg={variantColor}>
                <b>{`${title}:`}</b>
              </text>
            )}
            <box flexDirection="column" flexGrow={1}>
              {children}
            </box>
          </box>
          {dismissible && <text fg="#666">press Esc to dismiss</text>}
        </box>
      </box>
    </box>
  );
};
