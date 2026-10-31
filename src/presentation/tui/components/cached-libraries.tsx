import { List } from "@/components/ui/list";
import { useLibraries } from "@/hooks/use-libraries";
import { useTheme } from "@/hooks/use-theme";

const CachedLibraries = ({
  focusMode,
  selectedIndex,
  onActiveIndexChange,
  onSelect,
}: {
  focusMode: "cached" | "input";
  selectedIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (root: string) => void;
}) => {
  const { libraries } = useLibraries();
  const { colors } = useTheme();

  return (
    libraries.length > 0 && (
      <box flexDirection="column">
        <text>
          <span fg={colors.accent}>{focusMode === "cached" ? "▸ " : "  "}</span>
          <span fg={colors.foreground}>Cached Libraries:</span>
        </text>
        <List
          activeIndex={selectedIndex}
          focused={focusMode === "cached"}
          items={libraries.map((library) => ({
            description: `${library.itemCount} files`,
            key: library.root,
            label: library.root,
          }))}
          onActiveIndexChange={onActiveIndexChange}
          onSelect={(item) => onSelect(item.key)}
        />
      </box>
    )
  );
};

export { CachedLibraries };
