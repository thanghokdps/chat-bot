import { describe, expect, it } from "vitest";
import { branchToLeaf } from "./branch";

describe("branchToLeaf", () => {
  // u1 → a1 → u2 → a2, plus a regenerated a2b and an edited prompt u2e → a2e
  const tree = [
    { id: "u1", parentMessageId: null },
    { id: "a1", parentMessageId: "u1" },
    { id: "u2", parentMessageId: "a1" },
    { id: "a2", parentMessageId: "u2" },
    { id: "a2b", parentMessageId: "u2" },
    { id: "u2e", parentMessageId: "a1" },
    { id: "a2e", parentMessageId: "u2e" },
  ];

  it("returns the branch ending at the leaf, oldest first", () => {
    expect(branchToLeaf(tree, "a2b").map((m) => m.id)).toEqual(["u1", "a1", "u2", "a2b"]);
  });

  it("follows an edited prompt's branch", () => {
    expect(branchToLeaf(tree, "a2e").map((m) => m.id)).toEqual(["u1", "a1", "u2e", "a2e"]);
  });

  it("is empty without a leaf or with an unknown leaf", () => {
    expect(branchToLeaf(tree, null)).toEqual([]);
    expect(branchToLeaf(tree, "missing")).toEqual([]);
  });

  it("stops on a parent cycle instead of looping", () => {
    const cyclic = [
      { id: "x", parentMessageId: "y" },
      { id: "y", parentMessageId: "x" },
    ];
    expect(branchToLeaf(cyclic, "x").map((m) => m.id)).toEqual(["y", "x"]);
  });
});
