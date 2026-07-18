import type { UseOperationsReturn } from "#/hooks/use-operations";
import { colors } from "#/theme";

type StatusBarProps = {
  stats: UseOperationsReturn["stats"];
  mode: string;
};

export function StatusBar({ stats, mode }: StatusBarProps) {
  return (
    <box
      backgroundColor={colors.bgDark}
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
    >
      <text>
        <span fg={colors.accent}>[</span>
        <span fg={colors.success}>{stats.accepted} accepted</span>
        <span fg={colors.accent}> | </span>
        <span fg={colors.error}>{stats.rejected} rejected</span>
        <span fg={colors.accent}> | </span>
        <span fg={colors.warning}>{stats.modified} modified</span>
        <span fg={colors.accent}> / </span>
        <span fg={colors.fg}>{stats.total} total</span>
        <span fg={colors.accent}>]</span>
      </text>
      <text>
        <span fg={colors.muted}>{mode}</span>
        <span fg={colors.accent}> | </span>
        <span fg={colors.muted}>? help</span>
      </text>
    </box>
  );
}
