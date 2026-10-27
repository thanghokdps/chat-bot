import { describe, expect, it } from "vitest";
import { PROPOSE_RENAME, proposeRename, proposeRenameTool, readProposal, renameReply } from "./propose-rename";

describe("proposeRename", () => {
  it("accepts a title and trims it", () => {
    expect(proposeRename("  Q4 planning  ")).toEqual({ ok: true, title: "Q4 planning" });
  });

  it("accepts exactly 80 characters", () => {
    expect(proposeRename("a".repeat(80))).toEqual({ ok: true, title: "a".repeat(80) });
  });

  it.each([["   "], [""], ["a".repeat(81)]])("rejects %j", (title) => {
    expect(proposeRename(title)).toEqual({ ok: false });
  });
});

describe("readProposal", () => {
  it("re-validates the tool's JSON output", () => {
    expect(readProposal('{"ok":true,"title":" Trip "}')).toEqual({ ok: true, title: "Trip" });
    expect(readProposal('{"ok":false}')).toEqual({ ok: false });
  });

  it("treats a tool error message as an invalid title", () => {
    expect(readProposal("Error invoking tool 'propose_rename' with kwargs {}")).toEqual({ ok: false });
  });
});

describe("renameReply", () => {
  it("quotes the proposed title", () => {
    expect(renameReply({ ok: true, title: "Q4 planning" })).toBe("Rename this chat to “Q4 planning”?");
  });

  it("explains the length rule for an invalid title", () => {
    expect(renameReply({ ok: false })).toBe("Chat titles must be 1–80 characters. Try a different title.");
  });
});

describe("proposeRenameTool", () => {
  it("returns directly so no second model call paraphrases the copy", () => {
    expect(proposeRenameTool.name).toBe(PROPOSE_RENAME);
    expect(proposeRenameTool.returnDirect).toBe(true);
  });

  it("has no identity or target fields the model could fill", () => {
    const keys = Object.keys(proposeRenameTool.schema.shape);
    expect(keys).toEqual(["title"]);
  });

  it("serialises the validation result", async () => {
    expect(JSON.parse(await proposeRenameTool.invoke({ title: " Trip " }))).toEqual({ ok: true, title: "Trip" });
  });
});
