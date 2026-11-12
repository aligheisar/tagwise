import { Fragment } from "react";
import type { StatusVariant } from "@/components/ui/status-message";
import { StatusMessage } from "@/components/ui/status-message";
import { useTheme } from "@/hooks/use-theme";

type StatusBarItem = {
  id: string;
  label: string;
  separatorAfter?: string;
  value: string | number;
  variant?: StatusVariant;
};

type StatusBarData = {
  help?: string;
  items: StatusBarItem[];
  mode?: string;
};

export function StatusBar({ data }: { data: StatusBarData }) {
  const { colors } = useTheme();
  return (
    <box
      backgroundColor={colors.background}
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
    >
      <box flexDirection="row" gap={1}>
        {data.items.map((item, index) => (
          <Fragment key={item.id}>
            <box flexDirection="row" gap={1}>
              {item.variant ? (
                <StatusMessage variant={item.variant}>
                  <text>{`${item.value} ${item.label}`}</text>
                </StatusMessage>
              ) : (
                <text
                  fg={colors.foreground}
                >{`${item.value} ${item.label}`}</text>
              )}
            </box>
            {index < data.items.length - 1 && (
              <text fg={colors.border}>{item.separatorAfter ?? "|"}</text>
            )}
          </Fragment>
        ))}
      </box>
      <text>
        {data.mode && <span fg={colors.muted}>{data.mode}</span>}
        {data.mode && data.help && <span fg={colors.accent}> | </span>}
        {data.help && <span fg={colors.muted}>{data.help}</span>}
      </text>
    </box>
  );
}
