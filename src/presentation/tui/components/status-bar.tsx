import { StatusMessage } from "@/components/ui/status-message";
import type { UseOperationsReturn } from "@/hooks/use-operations";
import { useTheme } from "@/hooks/use-theme";

type StatusBarProps = {
  stats: UseOperationsReturn["stats"];
  mode: string;
};

export function StatusBar({ stats, mode }: StatusBarProps) {
  const { colors } = useTheme();
  const theme = useTheme();
  return (
    <box
      backgroundColor={colors.background}
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
    >
      <box flexDirection="row" gap={1}>
        <StatusMessage variant="success">
          <text>{`${stats.accepted} accepted`}</text>
        </StatusMessage>
        <text fg={theme.colors.border}>|</text>
        <StatusMessage variant="error">
          <text>{`${stats.rejected} rejected`}</text>
        </StatusMessage>
        <text fg={theme.colors.border}>|</text>
        <StatusMessage variant="warning">
          <text>{`${stats.modified} modified`}</text>
        </StatusMessage>
        <text fg={theme.colors.border}>/</text>
        <text fg={colors.foreground}>{`${stats.total} total`}</text>
      </box>
      <text>
        <span fg={colors.muted}>{mode}</span>
        <span fg={colors.accent}> | </span>
        <span fg={colors.muted}>? help</span>
      </text>
    </box>
  );
}
