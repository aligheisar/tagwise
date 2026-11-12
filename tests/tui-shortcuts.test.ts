import { describe, expect, test } from "bun:test";
import {
  getHelpShortcuts,
  isHelpToggleKey,
} from "../src/presentation/tui/lib/shortcuts";
import { getListWindow } from "../src/presentation/tui/lib/list-window";
import { getVimJumpAction } from "../src/presentation/tui/lib/vim-navigation";

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
    expect(getHelpShortcuts("review")).toContainEqual({
      key: "gg / G",
      description: "Jump to first / last item",
    });
  });

  describe("TUI list window", () => {
    test("keeps the active last item visible within the configured height", () => {
      const window = getListWindow(11, 10, 10);

      expect(window).toEqual({ endIndex: 11, startIndex: 1 });
      expect(window.endIndex - window.startIndex).toBe(10);
    });
  });

  test("maps gg to the first item and shifted g to the last item", () => {
    expect(getVimJumpAction({ name: "g" }, false)).toBe("pending");
    expect(getVimJumpAction({ name: "g" }, true)).toBe("first");
    expect(getVimJumpAction({ name: "g", shift: true }, false)).toBe("last");
    expect(getVimJumpAction({ name: "G" }, false)).toBe("last");
    expect(getVimJumpAction({ name: "j" }, true)).toBeNull();
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
