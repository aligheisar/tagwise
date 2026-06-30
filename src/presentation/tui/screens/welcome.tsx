import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useState } from "react";

type WelcomeScreenProps = {
  cachedLibraries: string[];
  onSelectCached: (root: string) => void;
  onScan: (path: string) => void;
};

async function getSuggestions(input: string): Promise<string[]> {
  if (!input.trim()) return [];

  const expanded = input.startsWith("~")
    ? input.replace("~", process.env.HOME ?? "")
    : input;

  if (expanded.endsWith("/")) {
    try {
      const entries = await readdir(expanded, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => `${expanded}${e.name}/`)
        .slice(0, 10);
    } catch {
      return [];
    }
  }

  const parent = dirname(expanded);
  const prefix = basename(expanded);

  try {
    const entries = await readdir(parent, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name.startsWith(prefix))
      .map((e) => `${join(parent, e.name)}/`)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function WelcomeScreen({
  cachedLibraries,
  onSelectCached,
  onScan,
}: WelcomeScreenProps) {
  const renderer = useRenderer();
  const [inputValue, setInputValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"cached" | "input">(
    cachedLibraries.length > 0 ? "cached" : "input",
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setSuggestionIndex(-1);
    getSuggestions(value).then(setSuggestions);
  }, []);

  useKeyboard((key) => {
    if (focusMode === "input") {
      switch (key.name) {
        case "escape":
          setFocusMode("cached");
          return;
        case "up":
        case "k":
          if (suggestions.length > 0) {
            setSuggestionIndex((prev) => Math.max(-1, prev - 1));
          }
          return;
        case "down":
        case "j":
          if (suggestions.length > 0) {
            setSuggestionIndex((prev) =>
              Math.min(suggestions.length - 1, prev + 1),
            );
          }
          return;
        case "return": {
          if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
            const selected = suggestions[suggestionIndex];
            if (selected) onScan(selected.replace(/\/$/, ""));
          } else if (inputValue.trim()) {
            onScan(inputValue.trim());
          }
          return;
        }
        default:
          return;
      }
    }

    switch (key.name) {
      case "q":
        renderer.destroy();
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
        if (cachedLibraries.length > 0) {
          const selected = cachedLibraries[selectedIndex];
          if (selected) onSelectCached(selected);
        }
        break;
      }
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={2}>
      <box justifyContent="center" marginBottom={1}>
        <text>
          <span fg="#7aa2f7">
            {"  ╔═══════════════════════════════════════════╗"}
          </span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#c0caf5">
            {"              TAGWISE TUI                    "}
          </span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#565f89">
            {"        Music Library Tag Manager            "}
          </span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">
            {"  ╚═══════════════════════════════════════════╝"}
          </span>
        </text>
      </box>

      {cachedLibraries.length > 0 && (
        <box flexDirection="column" marginBottom={1}>
          <text>
            <span fg="#e0af68">{focusMode === "cached" ? "▸ " : "  "}</span>
            <span fg="#c0caf5">Cached Libraries:</span>
          </text>
          {cachedLibraries.map((lib, i) => (
            <box key={lib} paddingX={2}>
              <text>
                <span
                  fg={
                    i === selectedIndex && focusMode === "cached"
                      ? "#9ece6a"
                      : "#565f89"
                  }
                >
                  {i === selectedIndex && focusMode === "cached" ? "→ " : "  "}
                </span>
                <span
                  fg={
                    i === selectedIndex && focusMode === "cached"
                      ? "#c0caf5"
                      : "#a9b1d6"
                  }
                >
                  {lib}
                </span>
              </text>
            </box>
          ))}
        </box>
      )}

      <box flexDirection="column" marginBottom={1}>
        <text>
          <span fg="#e0af68">{focusMode === "input" ? "▸ " : "  "}</span>
          <span fg="#c0caf5">Scan a new folder:</span>
        </text>
        <box paddingX={2} paddingY={1}>
          <box
            border
            borderColor={focusMode === "input" ? "#7aa2f7" : "#565f89"}
            flexGrow={1}
            padding={1}
          >
            <input
              focused={focusMode === "input"}
              onChange={handleInputChange}
              placeholder="Enter folder path..."
              value={inputValue}
            />
          </box>
        </box>

        {suggestions.length > 0 && (
          <box
            border
            borderColor="#565f89"
            flexDirection="column"
            marginTop={0}
            paddingX={1}
          >
            {suggestions.map((s, i) => (
              <box key={s}>
                <text>
                  <span fg="#565f89">
                    {i === suggestionIndex ? "→ " : "  "}
                  </span>
                  <span fg={i === suggestionIndex ? "#c0caf5" : "#a9b1d6"}>
                    {s}
                  </span>
                </text>
              </box>
            ))}
          </box>
        )}
      </box>

      <box marginTop={1}>
        <text>
          <span fg="#565f89">
            {focusMode === "input"
              ? " Enter: scan | ↑↓: suggestions | Esc: back"
              : " Tab: input | Enter: select | ↑↓: navigate | q: quit"}
          </span>
        </text>
      </box>
    </box>
  );
}
