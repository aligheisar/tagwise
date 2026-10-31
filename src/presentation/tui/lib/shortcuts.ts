import type { Screen } from "@/types/screen";

type HelpShortcut = {
  key: string;
  description: string;
};

type KeyboardKey = {
  name: string;
  raw?: string;
  sequence?: string;
  shift?: boolean;
};

function isHelpToggleKey(key: KeyboardKey, enabled = true): boolean {
  if (!enabled) return false;

  return (
    key.name === "?" ||
    key.sequence === "?" ||
    key.raw === "?" ||
    (Boolean(key.shift) && (key.name === "slash" || key.name === "/"))
  );
}

const SCREEN_SHORTCUTS: Record<Screen["type"], HelpShortcut[]> = {
  apply: [
    { description: "Apply reviewed operations", key: "Enter" },
    { description: "Return to review", key: "Esc" },
    { description: "Quit", key: "q" },
  ],
  "producer-select": [
    { description: "Move selection", key: "j / k" },
    { description: "Reorder producers", key: "Shift+J/K" },
    { description: "Return to welcome", key: "Esc" },
    { description: "Toggle producer", key: "Space" },
    { description: "Select all / none", key: "a / n" },
    { description: "Run selected producers", key: "Enter" },
    { description: "Quit", key: "q" },
  ],
  review: [
    { description: "Move through proposals", key: "j / k" },
    { description: "Move proposal in apply order", key: "Shift+J/K" },
    { description: "Collapse / expand folder", key: "h / l" },
    { description: "Accept or reject proposal", key: "Space" },
    { description: "Accept or reject folder", key: "a / r" },
    { description: "Accept or reject all", key: "A / R" },
    { description: "View proposal detail", key: "i" },
    { description: "Review and apply", key: "Enter" },
    { description: "Return to producer selection", key: "Esc" },
    { description: "Quit", key: "q" },
  ],
  scanning: [{ description: "Cancel scan", key: "Esc" }],
  welcome: [
    { description: "Focus folder input", key: "Tab" },
    { description: "Browse cached libraries", key: "j / k" },
    { description: "Scan or open selected library", key: "Enter" },
  ],
};

function getHelpShortcuts(screen: Screen["type"]): HelpShortcut[] {
  return SCREEN_SHORTCUTS[screen];
}

export type { HelpShortcut };
export { getHelpShortcuts, isHelpToggleKey };
