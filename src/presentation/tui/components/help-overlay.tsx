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
      backgroundColor="#1a1a2e"
      border
      borderColor="#7aa2f7"
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
        <span fg="#7aa2f7">{"  ╔══════════════════════════════════════╗"}</span>
      </text>
      <text>
        <span fg="#7aa2f7">{"  ║"}</span>
        <span fg="#c0caf5">{"         KEYBOARD SHORTCUTS            "}</span>
        <span fg="#7aa2f7">{"║"}</span>
      </text>
      <text>
        <span fg="#7aa2f7">{"  ╠══════════════════════════════════════╣"}</span>
      </text>
      {SHORTCUTS.map((s) => (
        <text key={s.key}>
          <span fg="#7aa2f7">{"  ║  "}</span>
          <span fg="#e0af68">{s.key.padEnd(14)}</span>
          <span fg="#a9b1d6">{s.desc}</span>
          <span fg="#7aa2f7">{"  ║"}</span>
        </text>
      ))}
      <text>
        <span fg="#7aa2f7">{"  ╚══════════════════════════════════════╝"}</span>
      </text>
      <text>
        <span fg="#565f89">{"                 Press ? to close"}</span>
      </text>
    </box>
  );
}
