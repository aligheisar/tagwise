import "opentui-spinner/react";
import { useKeyboard } from "@opentui/react";
import { useApp } from "#/hooks/use-app";
import { colors } from "#/theme";

export function ScanningScreen() {
  const { abortScan, folder } = useApp();

  useKeyboard((key) => {
    if (key.name === "escape") {
      abortScan();
    }
  });

  return (
    <box
      alignItems="center"
      flexDirection="column"
      flexGrow={1}
      justifyContent="center"
    >
      <box alignItems="center" gap={1} justifyContent="center" paddingX={1}>
        <text fg={colors.fgBright}>SCAN LIBRARY</text>
        <text fg={colors.warning}>{folder ?? "/rum/media/ali/toshiba"}</text>
        <box flexDirection="row" gap={1}>
          <text fg={colors.success}>Scanning</text>
          <spinner color={colors.success} name="binary" />
        </box>
      </box>
    </box>
  );
}
