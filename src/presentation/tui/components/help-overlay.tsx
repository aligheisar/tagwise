import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/hooks/use-theme";
import { getHelpShortcuts } from "@/lib/shortcuts";
import type { Screen } from "@/types/screen";

export function HelpOverlay({
  screen,
  onClose,
}: {
  screen: Screen["type"];
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const shortcuts = getHelpShortcuts(screen);

  return (
    <box
      height="70%"
      left="20%"
      position="absolute"
      top="15%"
      width="60%"
      zIndex={100}
    >
      <Modal
        backgroundColor={colors.background}
        borderColor={colors.accent}
        closeHint="Shift+/ | q to close"
        height="100%"
        onClose={onClose}
        open
        title={`Keyboard shortcuts · ${screen}`}
        width="100%"
      >
        {shortcuts.map((shortcut) => (
          <text key={shortcut.key}>
            <span fg={colors.warning}>{shortcut.key.padEnd(14)}</span>
            <span fg={colors.foreground}>{shortcut.description}</span>
          </text>
        ))}
      </Modal>
    </box>
  );
}
