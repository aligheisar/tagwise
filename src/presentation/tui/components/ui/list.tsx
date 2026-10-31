import { useKeyboard } from "@opentui/react";
import { useMemo, useState } from "react";

import { useTheme } from "@/hooks/use-theme";

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

  const setActiveIndex = (update: (index: number) => number) => {
    const next = update(activeIndex);
    if (controlledActiveIndex === undefined) setInternalActiveIndex(next);
    onActiveIndexChange?.(next);
  };

  const filtered = useMemo(() => {
    if (!filter) {
      return items;
    }
    const q = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filter]);

  useKeyboard((key) => {
    if (!focused) return;
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

  const visible = filtered.slice(0, height);

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
          <text fg={filter ? undefined : "#666"}>
            {filter || "Type to filter…"}
          </text>
        </box>
      ) : null}
      {visible.map((item, idx) => {
        const isActive = idx === activeIndex;
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
              <text fg="#666">{item.description}</text>
            ) : null}
          </box>
        );
      })}
      {filtered.length > height ? (
        <text fg="#666">{`${filtered.length - height} more…`}</text>
      ) : null}
    </box>
  );
};
