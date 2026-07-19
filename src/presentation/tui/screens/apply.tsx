import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { useApp } from "@/hooks/use-app";
import { colors } from "@/theme";

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
          .catch((_err) => {
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
        backgroundColor={colors.bgDark}
        border
        borderColor={colors.accent}
        flexDirection="column"
        padding={2}
        width={50}
      >
        <text>
          <span fg={colors.accent}>
            {"  ╔═══════════════════════════════════════╗"}
          </span>
        </text>
        <text>
          <span fg={colors.accent}>{"  ║"}</span>
          <span fg={colors.fgBright}>
            {"          CONFIRM CHANGES                  "}
          </span>
          <span fg={colors.accent}>{"║"}</span>
        </text>
        <text>
          <span fg={colors.accent}>
            {"  ╠═══════════════════════════════════════╣"}
          </span>
        </text>
        <text>
          <span fg={colors.accent}>{"  ║"}</span>
          <span fg={colors.fg}>{`  Total operations:  ${stats.total}`}</span>
          <span fg={colors.accent}>{"║"}</span>
        </text>
        <text>
          <span fg={colors.accent}>{"  ║"}</span>
          <span
            fg={colors.success}
          >{`  Will apply:        ${stats.accepted}`}</span>
          <span fg={colors.accent}>{"║"}</span>
        </text>
        <text>
          <span fg={colors.accent}>{"  ║"}</span>
          <span
            fg={colors.error}
          >{`  Will skip:         ${stats.rejected}`}</span>
          <span fg={colors.accent}>{"║"}</span>
        </text>
        <text>
          <span fg={colors.accent}>
            {"  ╠═══════════════════════════════════════╣"}
          </span>
        </text>

        {applying && (
          <text>
            <span fg={colors.accent}>{"  ║"}</span>
            <span fg={colors.warning}>{"  Applying changes..."}</span>
            <span fg={colors.accent}>{"║"}</span>
          </text>
        )}

        {result && (
          <box flexDirection="column">
            <text>
              <span fg={colors.accent}>{"  ║"}</span>
              <span fg={colors.success}>{`  Applied: ${result.success}`}</span>
              <span fg={colors.accent}>{"║"}</span>
            </text>
            {result.failed > 0 && (
              <text>
                <span fg={colors.accent}>{"  ║"}</span>
                <span fg={colors.error}>{`  Failed:  ${result.failed}`}</span>
                <span fg={colors.accent}>{"║"}</span>
              </text>
            )}
          </box>
        )}

        {!applying && !result && (
          <text>
            <span fg={colors.accent}>{"  ║"}</span>
            <span fg={colors.muted}>{"  Enter: apply | Esc: cancel"}</span>
            <span fg={colors.accent}>{"║"}</span>
          </text>
        )}

        {result && (
          <text>
            <span fg={colors.accent}>{"  ║"}</span>
            <span fg={colors.muted}>{"  Press any key to exit"}</span>
            <span fg={colors.accent}>{"║"}</span>
          </text>
        )}

        <text>
          <span fg={colors.accent}>
            {"  ╚═══════════════════════════════════════╝"}
          </span>
        </text>
      </box>
    </box>
  );
}
