import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { producerService } from "#/containers/producer.container";
import { useApp } from "@/hooks/use-app";
import { colors } from "@/theme";

export function ProducerSelect() {
  const renderer = useRenderer();
  const producers = producerService.getAll();
  const { handleProducerConfirm } = useApp();

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
        handleProducerConfirm(selected);
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
          <span fg={colors.accent}>
            {"  ╔═══════════════════════════════════════════╗"}
          </span>
        </text>
        <text>
          <span fg={colors.accent}>{"  ║"}</span>
          <span fg={colors.fgBright}>
            {"           SELECT PRODUCERS                 "}
          </span>
          <span fg={colors.accent}>{"║"}</span>
        </text>
        <text>
          <span fg={colors.accent}>
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
              backgroundColor={isCursor ? colors.bgHighlight : undefined}
              flexDirection="row"
              key={producer.name}
              paddingX={2}
              paddingY={0}
            >
              <text>
                <span fg={isCursor ? colors.warning : colors.muted}>
                  {isCursor ? "→ " : "  "}
                </span>
                <span fg={isSelected ? colors.success : colors.error}>
                  {isSelected ? "[x] " : "[ ] "}
                </span>
                <span fg={colors.accent}>{producer.name}</span>
                <span fg={colors.muted}>
                  {producer.description && ` — ${producer.description}`}
                </span>
              </text>
            </box>
          );
        })}
      </box>

      <box marginTop={1}>
        <text>
          <span fg={colors.muted}>
            {
              "  Space: toggle | a: select all | n: deselect all | Enter: confirm"
            }
          </span>
        </text>
      </box>
    </box>
  );
}
