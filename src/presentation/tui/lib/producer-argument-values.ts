import type {
  Producer,
  ProducerArgumentInputValues,
  ProducerArguments,
} from "#/types/producer";

/** Builds editable form values from a producer's declared defaults. */
function toProducerArgumentInputValues(
  producer: Producer,
): ProducerArgumentInputValues {
  return Object.fromEntries(
    (producer.args ?? [])
      .filter((argument) => argument.default !== undefined)
      .map((argument) => [
        argument.key,
        typeof argument.default === "boolean"
          ? argument.default
          : String(argument.default),
      ]),
  );
}

/** Validates form values and converts them to producer argument values. */
function resolveProducerArgumentValues(
  producer: Producer,
  values: ProducerArgumentInputValues,
): ProducerArguments {
  const resolved: Record<string, string | number | boolean> = {};
  for (const argument of producer.args ?? []) {
    const inputValue = values[argument.key];
    const defaultValue =
      typeof argument.default === "boolean"
        ? argument.default
        : argument.default === undefined
          ? undefined
          : String(argument.default);
    const isBlankNumber =
      argument.type === "number" &&
      typeof inputValue === "string" &&
      inputValue.trim() === "";
    const value =
      inputValue == null || isBlankNumber ? defaultValue : inputValue;
    const isRequired =
      argument.required === true && argument.default === undefined;
    if (
      isRequired &&
      (value === undefined ||
        (typeof value === "string" && value.trim() === ""))
    ) {
      throw new Error(`"${argument.title}" is required`);
    }

    if (
      argument.type !== "boolean" &&
      (value === undefined || value === "") &&
      argument.default === undefined
    ) {
      continue;
    }

    if (argument.type === "number") {
      const number = Number(value);
      if (typeof value !== "string" || !Number.isFinite(number)) {
        throw new Error(`"${argument.title}" must be a valid number`);
      }
      resolved[argument.key] = number;
      continue;
    }
    if (argument.type === "boolean") {
      resolved[argument.key] = value === true;
      continue;
    }
    if (
      argument.type === "select" &&
      !argument.options.some((option) => option.value === value)
    ) {
      throw new Error(`Choose a valid option for "${argument.title}"`);
    }
    resolved[argument.key] = value ?? "";
  }
  return resolved;
}

export { resolveProducerArgumentValues, toProducerArgumentInputValues };
