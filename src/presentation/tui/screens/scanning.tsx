import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { useApp } from "#/hooks/use-app";
import { colors } from "#/theme";

export function ScanningScreen() {
  const { abortScan, folder } = useApp();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useKeyboard((key) => {
    if (key.name === "escape") {
      abortScan();
    }
  });

  return (
    <box
      alignItems="center"
      flexDirection="column"
      flexGrow={1}
      justifyContent="center"
    >
      <text>
        <span fg={colors.accent}>
          {"  ╔═══════════════════════════════════════════╗"}
        </span>
      </text>
      <text>
        <span fg={colors.accent}>{"  ║"}</span>
        <span fg={colors.fgBright}>
          {"            SCANNING LIBRARY                 "}
        </span>
        <span fg={colors.accent}>{"║"}</span>
      </text>
      <text>
        <span fg={colors.accent}>
          {"  ╠═══════════════════════════════════════════╣"}
        </span>
      </text>
      <text>
        <span fg={colors.accent}>{"  ║"}</span>
        <span fg={colors.warning}>{`  ${folder}`}</span>
        <span fg={colors.accent}>{"║"}</span>
      </text>
      <text>
        <span fg={colors.accent}>{"  ║"}</span>
        <span fg={colors.success}>{`  Scanning${dots}`}</span>
        <span fg={colors.accent}>{"║"}</span>
      </text>
      <text>
        <span fg={colors.accent}>
          {"  ╚═══════════════════════════════════════════╝"}
        </span>
      </text>
    </box>
  );
}
