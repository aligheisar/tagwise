import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import { CachedLibraries } from "@/components/cached-libraries";
import { ScanFolderInput } from "@/components/scan-folder-input";
import { ScreenInfo } from "@/components/screen-info";
import { useApp } from "@/hooks/use-app";
import { useTheme } from "@/hooks/use-theme";

export function WelcomeScreen() {
  const { colors } = useTheme();
  const renderer = useRenderer();
  const { handleSelectCached, helpOpen, setHelpShortcutEnabled } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"cached" | "input">("cached");

  useEffect(() => {
    setHelpShortcutEnabled(focusMode !== "input");
    return () => setHelpShortcutEnabled(true);
  }, [focusMode, setHelpShortcutEnabled]);

  useKeyboard((key) => {
    if (helpOpen) return;

    switch (key.name) {
      case "q":
        if (focusMode !== "input") renderer.destroy();
        break;
      case "tab":
        setFocusMode("input");
        break;
    }
  });

  return (
    <box gap={1} height="100%" justifyContent="space-between">
      <box flexDirection="column" gap={1} padding={1}>
        <ScreenInfo
          description="Music Library Tag Manager"
          title="tagwise tui"
        />

        <CachedLibraries
          focusMode={focusMode}
          onActiveIndexChange={setSelectedIndex}
          onSelect={handleSelectCached}
          selectedIndex={selectedIndex}
        />
        <ScanFolderInput focusMode={focusMode} setFocusMode={setFocusMode} />
      </box>

      <box paddingX={1}>
        <text fg={colors.muted}>
          {focusMode === "input"
            ? "Enter: scan | ↑↓: suggestions | Esc: back"
            : "Tab: input | Enter: select | ↑↓/jk: navigate | q: quit"}
        </text>
      </box>
    </box>
  );
}
