import { describe, expect, test } from "bun:test";
import {
  getHelpShortcuts,
  isHelpToggleKey,
} from "../src/presentation/tui/lib/shortcuts";

describe("TUI help shortcuts", () => {
  test("provides help for every screen", () => {
    for (const screen of [
      "welcome",
      "scanning",
      "producer-select",
      "review",
      "apply",
    ] as const) {
      expect(getHelpShortcuts(screen).length).toBeGreaterThan(0);
    }
  });

  test("documents the review movement keys", () => {
    expect(getHelpShortcuts("review")).toContainEqual({
      key: "Shift+J/K",
      description: "Move proposal in apply order",
    });
  });

  test("recognizes OpenTUI's shifted slash key for help", () => {
    expect(isHelpToggleKey({ name: "slash", shift: true })).toBe(true);
    expect(isHelpToggleKey({ name: "/", shift: true })).toBe(true);
    expect(isHelpToggleKey({ name: "?" })).toBe(true);
    expect(isHelpToggleKey({ name: "unknown", sequence: "?", raw: "?" })).toBe(
      true,
    );
    expect(isHelpToggleKey({ name: "slash", shift: false })).toBe(false);
  });

  test("does not toggle help when disabled by welcome input focus", () => {
    expect(isHelpToggleKey({ name: "?" }, false)).toBe(false);
  });

  test("documents escape as the producer selection back action", () => {
    expect(getHelpShortcuts("producer-select")).toContainEqual({
      key: "Esc",
      description: "Return to welcome",
    });
  });

  test("documents escape from apply as back to review", () => {
    expect(getHelpShortcuts("apply")).toContainEqual({
      key: "Esc",
      description: "Return to review",
    });
  });

  test("documents escape from review as back to producer selection", () => {
    expect(getHelpShortcuts("review")).toContainEqual({
      key: "Esc",
      description: "Return to producer selection",
    });
  });
});
