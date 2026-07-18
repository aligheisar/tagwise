type Screen =
  | { type: "welcome" }
  | { type: "scanning" }
  | { type: "producer-select" }
  | { type: "review" }
  | { type: "apply" };

export type { Screen };
