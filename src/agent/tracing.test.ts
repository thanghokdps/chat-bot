import { describe, expect, it } from "vitest";
import { hashUserId, maskTraceData, redactPii } from "./tracing";

describe("redactPii", () => {
  it("redacts emails, card numbers and phone numbers", () => {
    expect(redactPii("mail andrew@example.com, card 4111 1111 1111 1111, call +1 (415) 555-0100")).toBe(
      "mail [email], card [card], call [phone]",
    );
  });

  it("leaves ordinary text alone", () => {
    expect(redactPii("Install the transformers library")).toBe("Install the transformers library");
  });
});

describe("maskTraceData", () => {
  const payload = { messages: [{ role: "user", content: "hi andrew@example.com" }], tokens: 12 };

  it("drops text by default and keeps structure and numbers", () => {
    expect(maskTraceData(payload, false)).toEqual({
      messages: [{ role: "[redacted 4 chars]", content: "[redacted 21 chars]" }],
      tokens: 12,
    });
  });

  it("keeps PII-redacted text when content tracing is on", () => {
    expect(maskTraceData(payload, true)).toEqual({
      messages: [{ role: "user", content: "hi [email]" }],
      tokens: 12,
    });
  });
});

describe("hashUserId", () => {
  it("is stable per secret and never the raw id", () => {
    const a = hashUserId("user-1", "secret");
    expect(a).toBe(hashUserId("user-1", "secret"));
    expect(a).not.toContain("user-1");
    expect(a).not.toBe(hashUserId("user-1", "other"));
  });
});
