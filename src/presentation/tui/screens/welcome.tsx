import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { CachedLibraries } from "@/components/cached-libraries";
import { LogoBanner } from "@/components/logo-banner";
import { ScanFolderInput } from "@/components/scan-folder-input";
import { useApp } from "@/hooks/use-app";
import { useLibraries } from "@/hooks/use-libraries";
import { colors } from "@/theme";

export function WelcomeScreen() {
  const renderer = useRenderer();
  const { libraries } = useLibraries();
  const { handleSelectCached } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"cached" | "input">("input");

  useKeyboard((key) => {
    switch (key.name) {
      case "q":
        if (focusMode !== "input") renderer.destroy();
        break;
      case "tab":
        setFocusMode("input");
        break;
      case "up":
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case "k":
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
        setSelectedIndex((prev) => Math.min(libraries.length - 1, prev + 1));
        break;
      case "j":
        setSelectedIndex((prev) => Math.min(libraries.length - 1, prev + 1));
        break;
      case "return": {
        if (focusMode !== "cached") return;
        if (libraries.length > 0) {
          const selected = libraries[selectedIndex];
          if (selected) handleSelectCached(selected.root);
        }
        break;
      }
    }
  });

  return (
    <box gap={1} height="100%" justifyContent="space-between">
      <box flexDirection="column" gap={1} padding={1}>
        <LogoBanner />
        <CachedLibraries focusMode={focusMode} selectedIndex={selectedIndex} />
        <ScanFolderInput focusMode={focusMode} setFocusMode={setFocusMode} />
      </box>

      <box>
        <text fg={colors.muted}>
          {focusMode === "input"
            ? " Enter: scan | ↑↓: suggestions | Esc: back"
            : " Tab: input | Enter: select | ↑↓/jk: navigate | q: quit"}
        </text>
      </box>
    </box>
  );
}
