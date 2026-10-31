import { getHelpShortcuts } from "@/lib/shortcuts";
import { colors } from "@/theme";
import type { Screen } from "@/types/screen";

export function HelpOverlay({ screen }: { screen: Screen["type"] }) {
  const shortcuts = getHelpShortcuts(screen);

  return (
    <box
      backgroundColor={colors.bgDark}
      border
      borderColor={colors.accent}
      flexDirection="column"
      height="70%"
      left="20%"
      padding={2}
      position="absolute"
      top="10%"
      width="60%"
      zIndex={100}
    >
      <text>
        <span fg={colors.accent}>KEYBOARD SHORTCUTS</span>
        <span fg={colors.muted}>{`  ${screen}`}</span>
      </text>
      {shortcuts.map((shortcut) => (
        <text key={shortcut.key}>
          <span fg={colors.warning}>{shortcut.key.padEnd(14)}</span>
          <span fg={colors.fg}>{shortcut.description}</span>
        </text>
      ))}
      <text>
        <span fg={colors.muted}>Press Shift+/ to close</span>
      </text>
    </box>
  );
}
