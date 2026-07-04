import { exists, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { useKeyboard } from "@opentui/react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

async function isExist(input: string) {
  return exists(input);
}

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
  onScan,
}: {
  focusMode: "cached" | "input";
  setFocusMode: Dispatch<SetStateAction<"cached" | "input">>;
  onScan: (path: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const handleInputChange = useCallback(async (value: string) => {
    setInputValue(value);
    setSuggestionIndex(-1);
    const suggestionsResult = await getSuggestions(value);
    setSuggestions(suggestionsResult);

    const isDirExist = await isExist(value.trim());
    if (isDirExist) return;

    setSuggestionIndex(0);
  }, []);

  useKeyboard((key) => {
    if (focusMode === "input") {
      switch (key.name) {
        case "escape":
          if (suggestionIndex >= 0) {
            setSuggestionIndex(-1);
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
          if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
            const selected = suggestions[suggestionIndex];

            if (selected) {
              setInputValue(selected);
              onScan(selected);
            }
          } else {
            const fn = async () => {
              const isExist = await exists(inputValue.trim());
              if (isExist) onScan(inputValue.trim());
            };

            fn();
          }
          break;
        }
      }
    }
  });

  return (
    <box flexDirection="column" marginBottom={1}>
      <text>
        <span fg="#e0af68">{focusMode === "input" ? "▸ " : "  "}</span>
        <span fg="#c0caf5">Scan a new folder:</span>
      </text>
      <box
        border
        borderColor={focusMode === "input" ? "#7aa2f7" : "#565f89"}
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
          borderColor="#565f89"
          flexDirection="column"
          marginTop={0}
          paddingX={1}
        >
          {suggestions.map((s, i) => (
            <box key={s}>
              <text>
                <span fg="#565f89">{i === suggestionIndex ? "→ " : "  "}</span>
                <span fg={i === suggestionIndex ? "#c0caf5" : "#a9b1d6"}>
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
