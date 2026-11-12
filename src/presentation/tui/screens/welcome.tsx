import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import { CachedLibraries } from "@/components/cached-libraries";
import { ScanFolderInput } from "@/components/scan-folder-input";
import { ScreenInfo } from "@/components/screen-info";
import { ShortcutsBar } from "@/components/shortcuts-bar";
import { useApp } from "@/hooks/use-app";
import { useLibraries } from "@/hooks/use-libraries";

export function WelcomeScreen() {
  const renderer = useRenderer();
  const { handleSelectCached, helpOpen, setHelpShortcutEnabled } = useApp();
  const { libraries } = useLibraries();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"cached" | "input">(
    libraries.length === 0 ? "input" : "cached",
  );

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
      <box flexDirection="column" gap={1}>
        <ScreenInfo
          description="Music Library Tag Manager"
          title="tagwise tui"
        />

        <CachedLibraries
          focusMode={focusMode}
          keyboardEnabled={!helpOpen}
          onActiveIndexChange={setSelectedIndex}
          onSelect={handleSelectCached}
          selectedIndex={selectedIndex}
        />
        <ScanFolderInput
          focusMode={focusMode}
          onBlur={() => {
            setFocusMode("cached");
          }}
        />
      </box>

      <ShortcutsBar
        data={{
          shortcuts:
            focusMode === "input"
              ? [
                  { description: "scan", key: "Enter" },
                  { description: "suggestions", key: "↑↓" },
                  { description: "back", key: "Esc" },
                ]
              : [
                  { description: "input", key: "Tab" },
                  { description: "select", key: "Enter" },
                  { description: "navigate", key: "↑↓/j/k" },
                  { description: "first/last", key: "gg/G" },
                  { description: "quit", key: "q" },
                ],
        }}
      />
    </box>
  );
}
