import { useKeyboard, useRenderer } from "@opentui/react";
import { useMemo, useState } from "react";
import { producerService } from "#/containers/producer.container";
import { ScreenInfo } from "#/presentation/tui/components/screen-info";
import { useApp } from "@/hooks/use-app";
import { colors } from "@/theme";

export function ProducerSelect() {
  const renderer = useRenderer();
  const producers = producerService.getAll();
  const { handleProducerConfirm, helpOpen, setScreen } = useApp();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(producers.map((p) => p.name)),
  );
  const [order, setOrder] = useState<string[]>(producers.map((p) => p.name));
  const [cursorIndex, setCursorIndex] = useState(0);

  const orderedProducers = useMemo(
    () =>
      order
        .map((name) => producers.find((p) => p.name === name))
        .filter(Boolean) as typeof producers,
    [order, producers],
  );

  const moveItem = (direction: -1 | 1) => {
    setOrder((prev) => {
      const nextIndex = cursorIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const a = prev[cursorIndex];
      const b = prev[nextIndex];
      if (a === undefined || b === undefined) return prev;
      const next = [...prev];
      next[cursorIndex] = b;
      next[nextIndex] = a;
      return next;
    });
    setCursorIndex((prev) => {
      const next = prev + direction;
      if (next < 0 || next >= orderedProducers.length) return prev;
      return next;
    });
  };

  useKeyboard((key) => {
    if (helpOpen) return;

    switch (key.name) {
      case "escape":
        setScreen({ type: "welcome" });
        break;
      case "q":
        renderer.destroy();
        break;
      case "up":
        setCursorIndex((prev) => Math.max(0, prev - 1));
        break;
      case "k":
        if (key.shift) moveItem(-1);
        else setCursorIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
        setCursorIndex((prev) =>
          Math.min(orderedProducers.length - 1, prev + 1),
        );
        break;
      case "j":
        if (key.shift) moveItem(1);
        else
          setCursorIndex((prev) =>
            Math.min(orderedProducers.length - 1, prev + 1),
          );
        break;
      case "space": {
        const producer = orderedProducers[cursorIndex];
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
        handleProducerConfirm(order.filter((name) => selected.has(name)));
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
    <box flexDirection="column" flexGrow={1} justifyContent="space-between">
      <box flexDirection="column" gap={1} padding={1}>
        <ScreenInfo
          description="Select your desired changes to library"
          title="select producers"
        />

        <box flexDirection="column">
          {orderedProducers.map((producer, i) => {
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
                  <span fg={colors.accent}>
                    {producer.title ?? producer.name}
                  </span>
                  <span fg={colors.muted}>
                    {producer.description && ` — ${producer.description}`}
                  </span>
                </text>
              </box>
            );
          })}
        </box>
      </box>
      <box paddingX={1}>
        <text>
          <span fg={colors.muted}>
            {
              "Esc: back | Space: toggle | a: all | n: none | J/K: reorder | Enter: confirm"
            }
          </span>
        </text>
      </box>
    </box>
  );
}
