const CachedLibraries = ({
  cachedLibraries,
  focusMode,
  selectedIndex,
}: {
  cachedLibraries: string[];
  focusMode: "cached" | "input";
  selectedIndex: number;
}) => {
  return (
    cachedLibraries.length > 0 && (
      <box flexDirection="column">
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
                    ? "#ebedf9"
                    : "#a9b1d6"
                }
              >
                {lib}
              </span>
            </text>
          </box>
        ))}
      </box>
    )
  );
};

export { CachedLibraries };
