import { useLibraries } from "#/hooks/use-libraries";

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
          <span fg="#e0af68">{focusMode === "cached" ? "▸ " : "  "}</span>
          <span fg="#c0caf5">Cached Libraries:</span>
        </text>
        {libraries.map((lib, i) => (
          <box key={lib.root} paddingX={2}>
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
                    ? "#ebedf9"
                    : "#a9b1d6"
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
