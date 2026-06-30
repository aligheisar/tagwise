import { useKeyboard } from "@opentui/react";
import { useEffect, useRef, useState } from "react";

type ScanningScreenProps = {
  folderPath: string;
  onScan: () => Promise<void>;
  onError: (error: string) => void;
  controller: AbortController;
};

export function ScanningScreen({
  folderPath,
  onScan,
  onError,
  controller,
}: ScanningScreenProps) {
  const [dots, setDots] = useState("");
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 400);

    onScanRef.current().catch((err) => {
      onErrorRef.current(err instanceof Error ? err.message : "Scan failed");
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  useKeyboard((key) => {
    if (key.name === "escape") {
      controller.abort();
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
        <span fg="#e0af68">{`  ${folderPath}`}</span>
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
