import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { logger } from "#/utils/logger";
import { ScreenInfo } from "@/components/screen-info";
import { useApp } from "@/hooks/use-app";
import { useTheme } from "@/hooks/use-theme";

export function ApplyScreen() {
  const { colors } = useTheme();
  const renderer = useRenderer();
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<{
    errors: string[];
    success: number;
    failed: number;
  } | null>(null);
  const {
    operations: { apply, stats },
    folder,
    helpOpen,
    setScreen,
  } = useApp();

  useKeyboard((key) => {
    if (helpOpen) return;
    if (applying) return;

    if (result) {
      renderer.destroy();
      return;
    }

    switch (key.name) {
      case "return":
        setApplying(true);
        if (!folder) {
          setResult({
            errors: ["No library folder is selected."],
            failed: 0,
            success: 0,
          });
          setApplying(false);
          return;
        }
        apply(folder)
          .then((r) => {
            setResult(r);
            setApplying(false);
          })
          .catch((error: unknown) => {
            const message =
              error instanceof Error ? error.message : String(error);
            logger.error("Failed to apply reviewed operations", { error });
            setResult({
              errors: [message],
              failed: stats.accepted + stats.modified,
              success: 0,
            });
            setApplying(false);
          });
        break;
      case "escape":
        setScreen({ type: "review" });
        break;
      case "q":
        renderer.destroy();
        break;
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} justifyContent="space-between">
      <box flexDirection="column" gap={1} padding={1}>
        <ScreenInfo
          description="Apply reviewed operations"
          title="confirm changes"
        />

        <box>
          <text
            fg={colors.foreground}
          >{`Total operations: ${stats.total}`}</text>
          <text fg={colors.success}>{`Will apply: ${stats.accepted}`}</text>
          <text fg={colors.error}>{`Will skip: ${stats.rejected}`}</text>

          {applying && <text fg={colors.warning}>{"Applying changes..."}</text>}

          {result && (
            <box flexDirection="column">
              <text fg={colors.success}>{`Applied: ${result.success}`}</text>
              {result.failed > 0 && (
                <text fg={colors.error}>{`Failed: ${result.failed}`}</text>
              )}
              {result.errors.slice(0, 5).map((error) => (
                <text fg={colors.error} key={error}>
                  {error}
                </text>
              ))}
            </box>
          )}
        </box>
      </box>

      <box flexDirection="column" padding={1}>
        {!applying && !result && (
          <text>
            <span fg={colors.muted}>
              {"Enter: apply | Esc: back to review"}
            </span>
          </text>
        )}

        {result && (
          <text>
            <span fg={colors.muted}>{"Press any key to exit"}</span>
          </text>
        )}
      </box>
    </box>
  );
}
