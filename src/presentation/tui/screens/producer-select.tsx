import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";

type ProducerSelectProps = {
  producers: { name: string; description: string }[];
  onConfirm: (selected: string[]) => void;
};

export function ProducerSelect({ producers, onConfirm }: ProducerSelectProps) {
  const renderer = useRenderer();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(producers.map((p) => p.name)),
  );
  const [cursorIndex, setCursorIndex] = useState(0);

  useKeyboard((key) => {
    switch (key.name) {
      case "q":
        renderer.destroy();
        break;
      case "up":
        setCursorIndex((prev) => Math.max(0, prev - 1));
        break;
      case "k":
        setCursorIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
        setCursorIndex((prev) => Math.min(producers.length - 1, prev + 1));
        break;
      case "j":
        setCursorIndex((prev) => Math.min(producers.length - 1, prev + 1));
        break;
      case "space": {
        const producer = producers[cursorIndex];
        if (producer) {
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(producer.name)) {
              next.delete(producer.name);
            } else {
              next.add(producer.name);
            }
            return next;
          });
        }
        break;
      }
      case "return":
        onConfirm(Array.from(selected));
        break;
      case "a":
        setSelected(new Set(producers.map((p) => p.name)));
        break;
      case "n":
        setSelected(new Set());
        break;
    }
  });

  return (
    <box flexDirection="column" flexGrow={1} padding={2}>
      <box marginBottom={1}>
        <text>
          <span fg="#7aa2f7">
            {"  ╔═══════════════════════════════════════════╗"}
          </span>
        </text>
        <text>
          <span fg="#7aa2f7">{"  ║"}</span>
          <span fg="#c0caf5">
            {"           SELECT PRODUCERS                 "}
          </span>
          <span fg="#7aa2f7">{"║"}</span>
        </text>
        <text>
          <span fg="#7aa2f7">
            {"  ╚═══════════════════════════════════════════╝"}
          </span>
        </text>
      </box>

      <box flexDirection="column" marginBottom={1}>
        {producers.map((producer, i) => {
          const isSelected = selected.has(producer.name);
          const isCursor = i === cursorIndex;
          return (
            <box
              backgroundColor={isCursor ? "#24283b" : undefined}
              flexDirection="row"
              key={producer.name}
              paddingX={2}
              paddingY={0}
            >
              <text>
                <span fg={isCursor ? "#e0af68" : "#565f89"}>
                  {isCursor ? "→ " : "  "}
                </span>
                <span fg={isSelected ? "#9ece6a" : "#f7768e"}>
                  {isSelected ? "[x] " : "[ ] "}
                </span>
                <span fg="#7aa2f7">{producer.name}</span>
                <span fg="#565f89">{` — ${producer.description}`}</span>
              </text>
            </box>
          );
        })}
      </box>

      <box marginTop={1}>
        <text>
          <span fg="#565f89">
            {
              "  Space: toggle | a: select all | n: deselect all | Enter: confirm"
            }
          </span>
        </text>
      </box>
    </box>
  );
}
