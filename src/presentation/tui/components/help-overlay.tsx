import { colors } from "@/theme";

const SHORTCUTS = [
  { desc: "Navigate down / up", key: "j / k" },
  { desc: "Collapse / expand folder", key: "h / l" },
  { desc: "View operation detail", key: "Enter" },
  { desc: "Toggle accept / reject", key: "Space" },
  { desc: "Accept all in folder", key: "a" },
  { desc: "Reject all in folder", key: "r" },
  { desc: "Accept all operations", key: "A (shift)" },
  { desc: "Reject all operations", key: "R (shift)" },
  { desc: "Modify operation", key: "m" },
  { desc: "Toggle this help", key: "? (shift+/)" },
  { desc: "Quit", key: "q" },
];

export function HelpOverlay() {
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
        <span fg={colors.accent}>
          {"  ╔══════════════════════════════════════╗"}
        </span>
      </text>
      <text>
        <span fg={colors.accent}>{"  ║"}</span>
        <span fg={colors.fgBright}>
          {"         KEYBOARD SHORTCUTS            "}
        </span>
        <span fg={colors.accent}>{"║"}</span>
      </text>
      <text>
        <span fg={colors.accent}>
          {"  ╠══════════════════════════════════════╣"}
        </span>
      </text>
      {SHORTCUTS.map((s) => (
        <text key={s.key}>
          <span fg={colors.accent}>{"  ║  "}</span>
          <span fg={colors.warning}>{s.key.padEnd(14)}</span>
          <span fg={colors.fg}>{s.desc}</span>
          <span fg={colors.accent}>{"  ║"}</span>
        </text>
      ))}
      <text>
        <span fg={colors.accent}>
          {"  ╚══════════════════════════════════════╝"}
        </span>
      </text>
      <text>
        <span fg={colors.muted}>{"                 Press ? to close"}</span>
      </text>
    </box>
  );
}
