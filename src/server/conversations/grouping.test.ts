import { describe, expect, it } from "vitest";
import { conversationGroup } from "./grouping";

describe("conversationGroup", () => {
  const now = new Date(2026, 9, 22, 15, 0);

  it("groups by local day", () => {
    expect(conversationGroup(new Date(2026, 9, 22, 0, 5), now)).toBe("today");
    expect(conversationGroup(new Date(2026, 9, 21, 23, 59), now)).toBe("last7Days");
    expect(conversationGroup(new Date(2026, 9, 15, 0, 0), now)).toBe("last7Days");
    expect(conversationGroup(new Date(2026, 9, 14, 23, 59), now)).toBe("older");
  });
});
