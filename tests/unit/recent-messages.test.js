import { describe, expect, it } from "vitest";

import { getRecentMessages } from "../../backend/utils/recent-messages.js";

describe("getRecentMessages", () => {
  it("keeps only the configured tail of the conversation", () => {
    const messages = Array.from({ length: 10 }, (_, index) => ({ index }));

    expect(getRecentMessages(messages, 3)).toEqual([
      { index: 7 },
      { index: 8 },
      { index: 9 },
    ]);
  });

  it("normalizes a missing history to an empty array", () => {
    expect(getRecentMessages(undefined)).toEqual([]);
  });
});
