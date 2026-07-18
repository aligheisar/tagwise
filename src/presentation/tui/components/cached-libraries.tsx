import { useLibraries } from "#/hooks/use-libraries";
import { colors } from "#/theme";

const CachedLibraries = ({
  focusMode,
  selectedIndex,
}: {
  focusMode: "cached" | "input";
  selectedIndex: number;
}) => {
  const { libraries } = useLibraries();

  return (
    libraries.length > 0 && (
      <box flexDirection="column">
        <text>
          <span fg={colors.warning}>
            {focusMode === "cached" ? "▸ " : "  "}
          </span>
          <span fg={colors.fgBright}>Cached Libraries:</span>
        </text>
        {libraries.map((lib, i) => (
          <box key={lib.root} paddingX={2}>
            <text>
              <span
                fg={
                  i === selectedIndex && focusMode === "cached"
                    ? colors.success
                    : colors.muted
                }
              >
                {i === selectedIndex && focusMode === "cached" ? "→ " : "  "}
              </span>
              <span
                fg={
                  i === selectedIndex && focusMode === "cached"
                    ? colors.fgBright
                    : colors.fg
                }
              >
                {lib.root}
              </span>
            </text>
          </box>
        ))}
      </box>
    )
  );
};

export { CachedLibraries };
