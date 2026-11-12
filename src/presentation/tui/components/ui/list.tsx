import { useKeyboard } from "@opentui/react";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useVimJump } from "@/hooks/use-vim-jump";
import { getListWindow } from "@/lib/list-window";

export interface ListItem {
  color?: string;
  description?: string;
  key: string;
  label: string;
}

export interface ListProps {
  activeIndex?: number;
  cursor?: string;
  filterable?: boolean;
  focused?: boolean;
  height?: number;
  items: ListItem[];
  onActiveIndexChange?: (index: number) => void;
  onSelect?: (item: ListItem) => void;
}

export const List = ({
  items,
  onSelect,
  filterable = false,
  focused = true,
  height = 10,
  cursor = "›",
  activeIndex: controlledActiveIndex,
  onActiveIndexChange,
}: ListProps) => {
  const theme = useTheme();
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");
  const activeIndex = controlledActiveIndex ?? internalActiveIndex;

  const filtered = useMemo(() => {
    if (!filter) {
      return items;
    }
    const q = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filter]);

  const setActiveIndex = useCallback(
    (update: (index: number) => number) => {
      const next = update(activeIndex);
      if (controlledActiveIndex === undefined) setInternalActiveIndex(next);
      onActiveIndexChange?.(next);
    },
    [activeIndex, controlledActiveIndex, onActiveIndexChange],
  );
  const handleVimJump = useVimJump({
    onJump: (index) => setActiveIndex(() => index),
    totalCount: filtered.length,
  });

  useKeyboard((key) => {
    if (!focused) return;
    if (!filterable && handleVimJump(key)) return;
    if (key.name === "up" || key.name === "k") {
      setActiveIndex((index) => Math.max(0, index - 1));
    } else if (key.name === "down" || key.name === "j") {
      setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (key.name === "return") {
      const item = filtered[activeIndex];
      if (item) {
        onSelect?.(item);
      }
    } else if (filterable && key.name === "backspace") {
      setFilter((f) => f.slice(0, -1));
    } else if (
      filterable &&
      key.name !== "escape" &&
      key.name !== "return" &&
      key.name !== "up" &&
      key.name !== "down" &&
      key.name !== "j" &&
      key.name !== "k" &&
      key.name.length === 1
    ) {
      setFilter((f) => f + key.name);
    }
  });

  const visibleWindow = getListWindow(filtered.length, height, activeIndex);
  const visible = filtered.slice(
    visibleWindow.startIndex,
    visibleWindow.endIndex,
  );

  return (
    <box flexDirection="column">
      {filterable ? (
        <box
          borderColor={theme.colors.border}
          borderStyle="rounded"
          marginBottom={1}
          paddingLeft={1}
          paddingRight={1}
        >
          <text fg={filter ? undefined : theme.colors.muted}>
            {filter || "Type to filter…"}
          </text>
        </box>
      ) : null}
      {visible.map((item, idx) => {
        const isActive = visibleWindow.startIndex + idx === activeIndex;
        const labelEl = isActive ? (
          <text fg={item.color ?? theme.colors.primary}>
            <b>{item.label}</b>
          </text>
        ) : (
          <text fg={item.color ?? theme.colors.foreground}>{item.label}</text>
        );
        return (
          <box flexDirection="row" gap={1} key={item.key}>
            <text fg={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : " "}
            </text>
            {labelEl}
            {item.description ? (
              <text
                fg={
                  isActive ? theme.colors.mutedForeground : theme.colors.muted
                }
              >
                {item.description}
              </text>
            ) : null}
          </box>
        );
      })}
      {visibleWindow.endIndex < filtered.length ? (
        <text
          fg={theme.colors.muted}
        >{`${filtered.length - visibleWindow.endIndex} more…`}</text>
      ) : null}
    </box>
  );
};
