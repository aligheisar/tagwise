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
  cursor?: string;
  filterable?: boolean;
  height?: number;
  items: ListItem[];
  onSelect?: (item: ListItem) => void;
}

export const List = ({
  items,
  onSelect,
  filterable = false,
  height = 10,
  cursor = "›",
}: ListProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) {
      return items;
    }
    const q = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, filter]);

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
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
          <box gap={1} key={item.key}>
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
