import { Fragment } from "react";
import { useTheme } from "@/hooks/use-theme";

type Shortcut = {
  key: string;
  description: string;
};

type ShortcutsBarData = {
  shortcuts: Shortcut[];
};

export function ShortcutsBar({ data }: { data: ShortcutsBarData }) {
  const { colors } = useTheme();
  if (data.shortcuts.length === 0) return null;

  return (
    <box backgroundColor={colors.background} flexDirection="row" paddingX={1}>
      <text>
        {data.shortcuts.map((shortcut, index) => (
          <Fragment key={`${shortcut.key}:${shortcut.description}`}>
            {index > 0 && <span fg={colors.border}> | </span>}
            <span fg={colors.foreground}>{shortcut.key}</span>
            <span fg={colors.muted}>{`:${shortcut.description}`}</span>
          </Fragment>
        ))}
      </text>
    </box>
  );
}
