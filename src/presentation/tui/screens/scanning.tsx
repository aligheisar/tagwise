import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { useApp } from "@/presentation/tui/hooks/use-app";

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
        <span fg="#7aa2f7">
          {"  ╔═══════════════════════════════════════════╗"}
        </span>
      </text>
      <text>
        <span fg="#7aa2f7">{"  ║"}</span>
        <span fg="#c0caf5">
          {"            SCANNING LIBRARY                 "}
        </span>
        <span fg="#7aa2f7">{"║"}</span>
      </text>
      <text>
        <span fg="#7aa2f7">
          {"  ╠═══════════════════════════════════════════╣"}
        </span>
      </text>
      <text>
        <span fg="#7aa2f7">{"  ║"}</span>
        <span fg="#e0af68">{`  ${folder}`}</span>
        <span fg="#7aa2f7">{"║"}</span>
      </text>
      <text>
        <span fg="#7aa2f7">{"  ║"}</span>
        <span fg="#9ece6a">{`  Scanning${dots}`}</span>
        <span fg="#7aa2f7">{"║"}</span>
      </text>
      <text>
        <span fg="#7aa2f7">
          {"  ╚═══════════════════════════════════════════╝"}
        </span>
      </text>
    </box>
  );
}
