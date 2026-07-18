import { access, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { useKeyboard } from "@opentui/react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import { useApp } from "#/hooks/use-app";
import { colors } from "#/theme";

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

const ScanFolderInput = ({
  focusMode,
  setFocusMode,
}: {
  focusMode: "cached" | "input";
  setFocusMode: Dispatch<SetStateAction<"cached" | "input">>;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const { handleScan } = useApp();

  const handleInputChange = useCallback(async (value: string) => {
    setInputValue(value);
    setSuggestionIndex(-1);
    const suggestionsResult = await getSuggestions(value);
    setSuggestions(suggestionsResult);

    if (suggestionsResult.length > 0) {
      setSuggestionIndex(0);
    }
  }, []);

  useKeyboard((key) => {
    if (focusMode === "input") {
      switch (key.name) {
        case "escape":
          if (suggestionIndex >= 0) {
            setSuggestionIndex(-1);
            setSuggestions([]);
            return;
          }

          setFocusMode("cached");
          return;
        case "up":
        case "p":
          if (key.name === "p" && !key.ctrl) return;

          if (suggestions.length > 0) {
            setSuggestionIndex((prev) => Math.max(-1, prev - 1));
          }
          return;
        case "down":
        case "n":
          if (key.name === "n" && !key.ctrl) return;

          if (suggestions.length > 0) {
            setSuggestionIndex((prev) =>
              Math.min(suggestions.length - 1, prev + 1),
            );
          }
          return;
        case "tab": {
          const selected = suggestions[suggestionIndex];
          if (selected) setInputValue(selected);
          break;
        }

        case "return": {
          const fn = async () => {
            try {
              await access(inputValue.trim());
              handleScan(inputValue.trim());
            } catch {}
          };

          fn();
          break;
        }
      }
    }
  });

  return (
    <box flexDirection="column" marginBottom={1}>
      <text>
        <span fg={colors.warning}>{focusMode === "input" ? "▸ " : "  "}</span>
        <span fg={colors.fgBright}>Scan a new folder:</span>
      </text>
      <box
        border
        borderColor={focusMode === "input" ? colors.accent : colors.muted}
        flexGrow={1}
        paddingX={1}
      >
        <input
          focused={focusMode === "input"}
          onInput={handleInputChange}
          placeholder="Enter folder path..."
          value={inputValue}
        />
      </box>
      {suggestions.length > 0 && focusMode === "input" && (
        <box
          border
          borderColor={colors.muted}
          flexDirection="column"
          marginTop={0}
          paddingX={1}
        >
          {suggestions.map((s, i) => (
            <box key={s}>
              <text>
                <span fg={colors.muted}>
                  {i === suggestionIndex ? "→ " : "  "}
                </span>
                <span fg={i === suggestionIndex ? colors.fgBright : colors.fg}>
                  {s}
                </span>
              </text>
            </box>
          ))}
        </box>
      )}
    </box>
  );
};

export { ScanFolderInput };
