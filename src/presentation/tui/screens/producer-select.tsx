import { useKeyboard, useRenderer } from "@opentui/react";
import { useMemo, useState } from "react";
import type {
  ProducerArgumentInputValues,
  ProducerArguments,
} from "#/types/producer";
import { ProducerDetailModal } from "@/components/producer-detail-modal";
import { ScreenInfo } from "@/components/screen-info";
import { ShortcutsBar } from "@/components/shortcuts-bar";
import { useApp } from "@/hooks/use-app";
import { useProducers } from "@/hooks/use-producers";
import { useTheme } from "@/hooks/use-theme";
import { useVimJump } from "@/hooks/use-vim-jump";
import {
  resolveProducerArgumentValues,
  toProducerArgumentInputValues,
} from "@/lib/producer-argument-values";

export function ProducerSelect() {
  const renderer = useRenderer();
  const { colors } = useTheme();
  const producers = useProducers();
  const { handleProducerConfirm, helpOpen, setScreen } = useApp();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(producers.map((p) => p.name)),
  );
  const [order, setOrder] = useState<string[]>(producers.map((p) => p.name));
  const [cursorIndex, setCursorIndex] = useState(0);
  const [detailProducerName, setDetailProducerName] = useState<string | null>(
    null,
  );
  const [detailError, setDetailError] = useState<string>();
  const [argumentValues, setArgumentValues] = useState<
    Record<string, ProducerArgumentInputValues>
  >(() =>
    Object.fromEntries(
      producers.map((producer) => [
        producer.name,
        toProducerArgumentInputValues(producer),
      ]),
    ),
  );

  const orderedProducers = useMemo(
    () =>
      order
        .map((name) => producers.find((p) => p.name === name))
        .filter(Boolean) as typeof producers,
    [order, producers],
  );
  const detailProducer = detailProducerName
    ? producers.find((producer) => producer.name === detailProducerName)
    : undefined;
  const handleVimJump = useVimJump({
    onJump: setCursorIndex,
    totalCount: orderedProducers.length,
  });

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

  const handleConfirm = () => {
    const selectedNames = order.filter((name) => selected.has(name));
    const resolvedArguments: Record<string, ProducerArguments> = {};
    for (const name of selectedNames) {
      const producer = producers.find((item) => item.name === name);
      if (!producer) continue;
      try {
        resolvedArguments[name] = resolveProducerArgumentValues(
          producer,
          argumentValues[name] ?? {},
        );
      } catch (error) {
        setDetailProducerName(name);
        setDetailError(error instanceof Error ? error.message : String(error));
        return;
      }
    }
    void handleProducerConfirm(selectedNames, resolvedArguments);
  };

  useKeyboard((key) => {
    if (helpOpen || detailProducerName) return;
    if (handleVimJump(key)) return;

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
        handleConfirm();
        break;
      case "i": {
        const producer = orderedProducers[cursorIndex];
        if (producer) {
          setDetailError(undefined);
          setDetailProducerName(producer.name);
        }
        break;
      }
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
      <box flexDirection="column" gap={1}>
        <ScreenInfo
          description="Select your desired changes to library"
          title="select producers"
        />

        <box flexDirection="column">
          {orderedProducers.map((producer, i) => {
            const isSelected = selected.has(producer.name);
            const isCursor = i === cursorIndex;
            return (
              <box flexDirection="row" key={producer.name}>
                <text>
                  <span fg={colors.accent}>{isCursor ? "› " : "  "}</span>
                  <span
                    fg={
                      isCursor
                        ? colors.accent
                        : isSelected
                          ? colors.success
                          : colors.error
                    }
                  >
                    {isSelected ? "[x] " : "[ ] "}
                  </span>
                  <span fg={isCursor ? colors.selection : colors.foreground}>
                    {producer.title ?? producer.name}
                  </span>
                  <span fg={isCursor ? colors.mutedForeground : colors.muted}>
                    {producer.description && ` — ${producer.description}`}
                  </span>
                </text>
              </box>
            );
          })}
        </box>
      </box>
      <ShortcutsBar
        data={{
          shortcuts: [
            { description: "back", key: "Esc" },
            { description: "navigate", key: "j/k" },
            { description: "first/last", key: "gg/G" },
            { description: "toggle", key: "Space" },
            { description: "details/arguments", key: "i" },
            { description: "all/none", key: "a/n" },
            { description: "reorder", key: "J/K" },
            { description: "confirm", key: "Enter" },
          ],
        }}
      />
      {detailProducer && (
        <ProducerDetailModal
          error={detailError}
          key={detailProducer.name}
          onChange={(key, value) => {
            setArgumentValues((previous) => ({
              ...previous,
              [detailProducer.name]: {
                ...previous[detailProducer.name],
                [key]: value,
              },
            }));
            setDetailError(undefined);
          }}
          onClose={() => {
            setDetailProducerName(null);
            setDetailError(undefined);
          }}
          producer={detailProducer}
          values={argumentValues[detailProducer.name] ?? {}}
        />
      )}
    </box>
  );
}
