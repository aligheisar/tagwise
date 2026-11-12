import { List } from "@/components/ui/list";
import { useLibraries } from "@/hooks/use-libraries";
import { useTheme } from "@/hooks/use-theme";

const CachedLibraries = ({
  focusMode,
  keyboardEnabled,
  selectedIndex,
  onActiveIndexChange,
  onSelect,
}: {
  focusMode: "cached" | "input";
  keyboardEnabled: boolean;
  selectedIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (root: string) => void;
}) => {
  const { libraries } = useLibraries();
  const { colors } = useTheme();

  return (
    <box flexDirection="column">
      <text>
        <span fg={colors.accent}>{focusMode === "cached" ? "▸ " : "  "}</span>
        <span fg={colors.foreground}>Cached Libraries:</span>
      </text>
      {libraries.length > 0 ? (
        <List
          activeIndex={selectedIndex}
          focused={focusMode === "cached" && keyboardEnabled}
          items={libraries.map((library) => ({
            description: `${library.itemCount} files`,
            key: library.root,
            label: library.root,
          }))}
          onActiveIndexChange={onActiveIndexChange}
          onSelect={(item) => onSelect(item.key)}
        />
      ) : (
        <text fg={colors.muted} marginLeft={2}>
          No Cached library available.
        </text>
      )}
    </box>
  );
};

export { CachedLibraries };
