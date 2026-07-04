import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { CachedLibraries } from "@/presentation/tui/components/cached-libraries";
import { LogoBanner } from "@/presentation/tui/components/logo-banner";
import { ScanFolderInput } from "@/presentation/tui/components/scan-folder-input";

type WelcomeScreenProps = {
  cachedLibraries: string[];
  onSelectCached: (root: string) => void;
  onScan: (path: string) => void;
};

export function WelcomeScreen({
  cachedLibraries,
  onSelectCached,
  onScan,
}: WelcomeScreenProps) {
  const renderer = useRenderer();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"cached" | "input">(
    cachedLibraries.length > 0 ? "cached" : "input",
  );

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
        setSelectedIndex((prev) =>
          Math.min(cachedLibraries.length - 1, prev + 1),
        );
        break;
      case "j":
        setSelectedIndex((prev) =>
          Math.min(cachedLibraries.length - 1, prev + 1),
        );
        break;
      case "return": {
        if (focusMode !== "cached") return;
        if (cachedLibraries.length > 0) {
          const selected = cachedLibraries[selectedIndex];
          if (selected) onSelectCached(selected);
        }
        break;
      }
    }
  });

  return (
    <box
      flexDirection="column"
      gap={1}
      height="100%"
      justifyContent="space-between"
    >
      <box flexDirection="column" gap={1} padding={1}>
        <LogoBanner />
        <CachedLibraries
          cachedLibraries={cachedLibraries}
          focusMode={focusMode}
          selectedIndex={selectedIndex}
        />
        <ScanFolderInput
          focusMode={focusMode}
          onScan={onScan}
          setFocusMode={setFocusMode}
        />
      </box>

      <box>
        <text>
          <span fg="#565f89">
            {focusMode === "input"
              ? " Enter: scan | ↑↓: suggestions | Esc: back"
              : " Tab: input | Enter: select | ↑↓/jk: navigate | q: quit"}
          </span>
        </text>
      </box>
    </box>
  );
}
