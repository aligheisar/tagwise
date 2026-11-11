import { describe, expect, test } from "bun:test";
import {
  resolveProducerArgumentValues,
  toProducerArgumentInputValues,
} from "../src/presentation/tui/lib/producer-argument-values";
import type { Producer } from "../src/types/producer";

const producer: Producer = {
  args: [
    { key: "text", title: "Text", type: "string", default: "initial" },
    { key: "count", title: "Count", type: "number", default: 5 },
    { key: "enabled", title: "Enabled", type: "boolean", default: true },
    {
      key: "mode",
      title: "Mode",
      type: "select",
      options: [
        { label: "First", value: "first" },
        { label: "Second", value: "second" },
      ],
      default: "first",
    },
    {
      key: "requiredText",
      title: "Required text",
      type: "string",
      required: true,
    },
    { key: "optionalText", title: "Optional text", type: "string" },
    {
      key: "defaultedRequired",
      title: "Defaulted required",
      type: "string",
      required: true,
      default: "fallback",
    },
  ],
  name: "test",
  title: "Test",
  version: "1.0.0",
  async produce() {
    return [];
  },
};

describe("producer argument form values", () => {
  test("initializes and resolves each supported argument type", () => {
    const initialValues = toProducerArgumentInputValues(producer);

    expect(initialValues).toEqual({
      count: "5",
      defaultedRequired: "fallback",
      mode: "first",
      enabled: true,
      text: "initial",
    });
    expect(
      resolveProducerArgumentValues(producer, {
        count: "12",
        enabled: false,
        mode: "second",
        requiredText: "provided",
        defaultedRequired: "fallback",
        text: "updated",
      }),
    ).toEqual({
      count: 12,
      enabled: false,
      mode: "second",
      requiredText: "provided",
      defaultedRequired: "fallback",
      text: "updated",
    });
  });

  test("requires marked fields and resolves defaults for unset fields", () => {
    expect(() =>
      resolveProducerArgumentValues(producer, {
        count: "5",
        enabled: true,
        mode: "first",
        defaultedRequired: "fallback",
        requiredText: "",
        text: "initial",
      }),
    ).toThrow('"Required text" is required');

    expect(
      resolveProducerArgumentValues(producer, {
        count: "5",
        enabled: true,
        mode: "first",
        requiredText: "present",
        text: "initial",
      }),
    ).toEqual({
      count: 5,
      defaultedRequired: "fallback",
      enabled: true,
      mode: "first",
      requiredText: "present",
      text: "initial",
    });
  });

  test("rejects invalid numbers and unlisted choices", () => {
    expect(() =>
      resolveProducerArgumentValues(producer, {
        count: "many",
        enabled: true,
        mode: "first",
        text: "",
      }),
    ).toThrow('"Count" must be a valid number');

    expect(() =>
      resolveProducerArgumentValues(producer, {
        count: "1",
        enabled: true,
        mode: "other",
        text: "",
      }),
    ).toThrow('Choose a valid option for "Mode"');
  });
});
