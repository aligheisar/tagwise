import type { UseOperationsReturn } from "#/hooks/use-operations";

type StatusBarProps = {
  stats: UseOperationsReturn["stats"];
  mode: string;
};

export function StatusBar({ stats, mode }: StatusBarProps) {
  return (
    <box
      backgroundColor="#1a1a2e"
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
    >
      <text>
        <span fg="#7aa2f7">[</span>
        <span fg="#9ece6a">{stats.accepted} accepted</span>
        <span fg="#7aa2f7"> | </span>
        <span fg="#f7768e">{stats.rejected} rejected</span>
        <span fg="#7aa2f7"> | </span>
        <span fg="#e0af68">{stats.modified} modified</span>
        <span fg="#7aa2f7"> / </span>
        <span fg="#a9b1d6">{stats.total} total</span>
        <span fg="#7aa2f7">]</span>
      </text>
      <text>
        <span fg="#565f89">{mode}</span>
        <span fg="#7aa2f7"> | </span>
        <span fg="#565f89">? help</span>
      </text>
    </box>
  );
}
