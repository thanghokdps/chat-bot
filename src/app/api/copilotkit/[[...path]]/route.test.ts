import { describe, expect, it, vi } from "vitest";
import { request, signInAs } from "@/test-utils/route";

vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => ({}) }));
const { POST } = await import("./route");

describe("/api/copilotkit", () => {
  it("refuses to start a runtime without a verified session", async () => {
    signInAs(null);
    const res = await POST(request("/api/copilotkit/agent/chat-assistant/run", { method: "POST", body: {} }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });
});
