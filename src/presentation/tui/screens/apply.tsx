import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { useApp } from "@/presentation/tui/hooks/use-app";

export function ApplyScreen() {
  const renderer = useRenderer();
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const {
    operations: { apply, stats },
    setScreen,
  } = useApp();

  useKeyboard((key) => {
    if (applying) return;

    if (result) {
      renderer.destroy();
      return;
    }

    switch (key.name) {
      case "return":
        setApplying(true);
        apply()
          .then((r) => {
            setResult(r);
            setApplying(false);
          })
          .catch((err) => {
            setApplying(false);
            setScreen({ type: "welcome" });
          });
        break;
      case "escape":
        setScreen({ type: "welcome" });
        break;
      case "q":
        renderer.destroy();
        break;
    }
  });

  return (
    <box
      alignItems="center"
      flexDirection="column"
      flexGrow={1}
      justifyContent="center"
    >
      <box
        backgroundColor="#1a1a2e"
        border
        borderColor="#7aa2f7"
        flexDirection="column"
        padding={2}
        width={50}
      >
        <text>
          <span fg="#7aa2f7">
            {"  ╔═══════════════════════════════════════╗"}
          </span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#c0caf5">
            {"          CONFIRM CHANGES                  "}
          </span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">
            {"  ╠═══════════════════════════════════════╣"}
          </span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#a9b1d6">{`  Total operations:  ${stats.total}`}</span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#9ece6a">{`  Will apply:        ${stats.accepted}`}</span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#f7768e">{`  Will skip:         ${stats.rejected}`}</span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">
            {"  ╠═══════════════════════════════════════╣"}
          </span>
        </text>

        {applying && (
          <text>
            <span fg="#7aa2f7">{"  ║"}</span>
            <span fg="#e0af68">{"  Applying changes..."}</span>
            <span fg="#7aa2f7">{"║"}</span>
          </text>
        )}

        {result && (
          <box flexDirection="column">
            <text>
              <span fg="#7aa2f7">{"  ║"}</span>
              <span fg="#9ece6a">{`  Applied: ${result.success}`}</span>
              <span fg="#7aa2f7">{"║"}</span>
            </text>
            {result.failed > 0 && (
              <text>
                <span fg="#7aa2f7">{"  ║"}</span>
                <span fg="#f7768e">{`  Failed:  ${result.failed}`}</span>
                <span fg="#7aa2f7">{"║"}</span>
              </text>
            )}
          </box>
        )}

        {!applying && !result && (
          <text>
            <span fg="#7aa2f7">{"  ║"}</span>
            <span fg="#565f89">{"  Enter: apply | Esc: cancel"}</span>
            <span fg="#7aa2f7">{"║"}</span>
          </text>
        )}

        {result && (
          <text>
            <span fg="#7aa2f7">{"  ║"}</span>
            <span fg="#565f89">{"  Press any key to exit"}</span>
            <span fg="#7aa2f7">{"║"}</span>
          </text>
        )}

        <text>
          <span fg="#7aa2f7">
            {"  ╚═══════════════════════════════════════╝"}
          </span>
        </text>
      </box>
    </box>
  );
}
