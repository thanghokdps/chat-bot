// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRenameProposal } from "./use-rename-proposal";

function setup(onRename = vi.fn(async (_title: string) => undefined)) {
  const onError = vi.fn();
  const hook = renderHook(() => useRenameProposal({ conversationId: "c1", onRename, onError }));
  return { hook, onRename, onError };
}

describe("useRenameProposal", () => {
  it("keeps a proposal for this conversation and ignores one for another", () => {
    const { hook } = setup();
    act(() => hook.result.current.receive({ conversationId: "c2", title: "Other" }));
    expect(hook.result.current.title).toBeNull();
    act(() => hook.result.current.receive({ conversationId: "c1", title: "Q4 planning" }));
    expect(hook.result.current.title).toBe("Q4 planning");
  });

  it("ignores a malformed event", () => {
    const { hook } = setup();
    act(() => hook.result.current.receive({ title: 3 }));
    expect(hook.result.current.title).toBeNull();
  });

  it("renames once on confirm, then closes", async () => {
    const { hook, onRename } = setup();
    act(() => hook.result.current.receive({ conversationId: "c1", title: "Q4 planning" }));
    await act(() => hook.result.current.confirm());
    expect(onRename).toHaveBeenCalledExactlyOnceWith("Q4 planning");
    expect(hook.result.current.title).toBeNull();
  });

  it("keeps the proposal and reports the failure when renaming fails", async () => {
    const { hook, onError } = setup(vi.fn(async () => Promise.reject(new Error("500"))));
    act(() => hook.result.current.receive({ conversationId: "c1", title: "Q4 planning" }));
    await act(() => hook.result.current.confirm());
    expect(onError).toHaveBeenCalledOnce();
    expect(hook.result.current.title).toBe("Q4 planning");
    expect(hook.result.current.isSaving).toBe(false);
  });

  it("clear drops the proposal without renaming", () => {
    const { hook, onRename } = setup();
    act(() => hook.result.current.receive({ conversationId: "c1", title: "Q4 planning" }));
    act(() => hook.result.current.clear());
    expect(hook.result.current.title).toBeNull();
    expect(onRename).not.toHaveBeenCalled();
  });
});
