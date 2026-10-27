import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth/auth";

export function GET(request: Request): Promise<Response> {
  return toNextJsHandler(auth()).GET(request);
}

export function POST(request: Request): Promise<Response> {
  return toNextJsHandler(auth()).POST(request);
}
