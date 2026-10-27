import { describe, expect, it } from "vitest";
import { z } from "zod";
import { HttpError, parseJson, route } from "./http";

const post = (body: string) => new Request("http://x/api", { method: "POST", body });

describe("route", () => {
  it("turns HttpError into a JSON status", async () => {
    const res = await route(async () => {
      throw new HttpError(404, "not_found");
    })(post(""));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("hides unexpected errors behind a 500", async () => {
    const res = await route(async () => {
      throw new Error("db password in message");
    })(post(""));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "internal" });
  });
});

describe("parseJson", () => {
  const schema = z.object({ title: z.string().min(1) });

  it("returns the parsed body", async () => {
    expect(await parseJson(post('{"title":"Hi"}'), schema)).toEqual({ title: "Hi" });
  });

  it.each(["not json", '{"title":""}', '{"other":1}'])("rejects %s with 400", async (body) => {
    await expect(parseJson(post(body), schema)).rejects.toMatchObject({ status: 400 });
  });
});
