import { useKeyboard } from "@opentui/react";
import { toast } from "@opentui-ui/toast";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import {
  getFolderSuggestions,
  validateFolder,
} from "#/services/folder-suggestion.service";
import { logger } from "#/utils/logger";
import { expandPath } from "#/utils/path";
import { useApp } from "@/hooks/use-app";
import { useTheme } from "@/hooks/use-theme";

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
  const { colors } = useTheme();

  const handleInputChange = useCallback(async (value: string) => {
    setInputValue(value);
    setSuggestionIndex(-1);
    const suggestionsResult = await getFolderSuggestions(value);
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
          const folder = inputValue.trim();
          if (!folder) {
            toast("Enter a folder path to scan");
            break;
          }
          const expanded = expandPath(folder);
          void validateFolder(expanded)
            .then((isValid) => {
              if (!isValid) {
                toast(`Cannot access folder: ${expanded}`);
                return;
              }
              handleScan(expanded);
            })
            .catch((error: unknown) => {
              logger.error("Selected scan folder is unavailable", {
                error,
                folder: expanded,
              });
              toast(
                `Cannot access folder: ${error instanceof Error ? error.message : String(error)}`,
              );
            });
          break;
        }
      }
    }
  });

  return (
    <box flexDirection="column" marginBottom={1}>
      <text>
        <span fg={colors.accent}>{focusMode === "input" ? "▸ " : "  "}</span>
        <span fg={colors.foreground}>Scan a new folder:</span>
      </text>
      <box
        border
        borderColor={focusMode === "input" ? colors.accent : colors.border}
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
          borderColor={colors.border}
          flexDirection="column"
          marginTop={0}
          paddingX={1}
        >
          {suggestions.map((s, i) => (
            <box key={s}>
              <text>
                <span fg={colors.secondaryForeground}>
                  {i === suggestionIndex ? "→ " : "  "}
                </span>
                <span
                  fg={
                    i === suggestionIndex
                      ? colors.secondaryForeground
                      : colors.secondary
                  }
                >
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
