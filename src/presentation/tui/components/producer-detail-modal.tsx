import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import type {
  Producer,
  ProducerArgument,
  ProducerArgumentInputValues,
} from "#/types/producer";
import { Modal } from "@/components/ui/modal";
import { useApp } from "@/hooks/use-app";
import { useTheme } from "@/hooks/use-theme";

type ProducerDetailModalProps = {
  error?: string;
  onChange: (key: string, value: string | boolean) => void;
  onClose: () => void;
  producer: Producer;
  values: ProducerArgumentInputValues;
};

type TextArgument =
  | Extract<ProducerArgument, { type: "string" }>
  | Extract<ProducerArgument, { type: "number" }>;

function isTextArgument(argument: ProducerArgument): argument is TextArgument {
  return argument.type === "string" || argument.type === "number";
}

export function ProducerDetailModal({
  error,
  onChange,
  onClose,
  producer,
  values,
}: ProducerDetailModalProps) {
  const { colors } = useTheme();
  const argumentsList = producer.args ?? [];
  const [focusIndex, setFocusIndex] = useState(0);
  const { setHelpShortcutEnabled } = useApp();

  const focusedArgument = argumentsList[focusIndex];

  useEffect(() => {
    setHelpShortcutEnabled(
      !focusedArgument || !isTextArgument(focusedArgument),
    );
    return () => setHelpShortcutEnabled(true);
  }, [focusedArgument, setHelpShortcutEnabled]);

  useKeyboard((key) => {
    if (key.name === "tab" && argumentsList.length > 0) {
      setFocusIndex(
        (index) =>
          (index + (key.shift ? -1 : 1) + argumentsList.length) %
          argumentsList.length,
      );
      return;
    }

    const argument = argumentsList[focusIndex];
    if (argument?.type === "boolean" && key.name === "space") {
      onChange(argument.key, values[argument.key] !== true);
    } else if (
      argument?.type === "select" &&
      (key.name === "left" || key.name === "right")
    ) {
      const options = argument.options;
      if (options.length === 0) return;
      const currentIndex = options.findIndex(
        (option) => option.value === values[argument.key],
      );
      const direction = key.name === "right" ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + options.length) % options.length;
      const nextOption = options[nextIndex];
      if (nextOption) onChange(argument.key, nextOption.value);
    }
  });

  return (
    <box
      height="80%"
      left="10%"
      position="absolute"
      top="10%"
      width="80%"
      zIndex={50}
    >
      <Modal
        backgroundColor={colors.background}
        borderColor={colors.accent}
        closeHint="Tab: next input | Space: toggle | Esc: close"
        height="100%"
        onClose={onClose}
        open
        title={producer.title ?? producer.name}
        width="100%"
      >
        <box flexDirection="column" gap={1}>
          {producer.description && (
            <text fg={colors.muted}>{producer.description}</text>
          )}
          {argumentsList.length === 0 ? (
            <text fg={colors.muted}>
              This producer has no configurable arguments.
            </text>
          ) : (
            argumentsList.map((argument, index) => {
              const isFocused = index === focusIndex;
              const value = values[argument.key];
              return (
                <box flexDirection="column" gap={0} key={argument.key}>
                  <text fg={isFocused ? colors.accent : colors.foreground}>
                    {isFocused ? "› " : "  "}
                    {argument.title}
                  </text>
                  {argument.description && (
                    <text fg={colors.muted}>{`  ${argument.description}`}</text>
                  )}
                  {isTextArgument(argument) ? (
                    <input
                      focused={isFocused}
                      onChange={(nextValue) =>
                        onChange(argument.key, nextValue)
                      }
                      placeholder={argument.type === "number" ? "0" : ""}
                      value={String(value ?? "")}
                      width="100%"
                    />
                  ) : argument.type === "boolean" ? (
                    <text fg={isFocused ? colors.accent : colors.foreground}>
                      {`  [${value === true ? "x" : " "}] ${value === true ? "Enabled" : "Disabled"}  (Space to toggle)`}
                    </text>
                  ) : (
                    <box flexDirection="row" gap={1}>
                      {argument.options.map((option) => (
                        <text
                          fg={
                            option.value === value
                              ? colors.accent
                              : colors.muted
                          }
                          key={option.value}
                        >
                          {option.value === value
                            ? `[${option.label}]`
                            : option.label}
                        </text>
                      ))}
                      {isFocused && <text fg={colors.muted}>← / →</text>}
                    </box>
                  )}
                </box>
              );
            })
          )}
          {error && <text fg={colors.error}>{error}</text>}
        </box>
      </Modal>
    </box>
  );
}
