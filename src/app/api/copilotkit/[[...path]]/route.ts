import { BuiltInAgent, CopilotRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { generateTitle, streamAnswer } from "@/agent/agents/chat-assistant";
import { verifiedUser } from "@/agent/identity";
import { AGENT_ID } from "@/agent/ids";
import { runTurn } from "@/agent/run-turn";
import { turnCallbacks } from "@/agent/tracing";
import { db } from "@/db/client";

export const runtime = "nodejs";

function chatAgent(userId: string, requestSignal: AbortSignal): BuiltInAgent {
  return new BuiltInAgent({
    type: "custom",
    factory: ({ input, abortSignal }) =>
      runTurn(
        // Either a stop request or the browser dropping the stream ends the turn.
        { userId, input, signal: AbortSignal.any([abortSignal, requestSignal]) },
        { db: db(), streamAnswer, generateTitle, callbacks: turnCallbacks({ userId, conversationId: input.threadId }) },
      ),
  });
}

async function handle(request: Request): Promise<Response> {
  const user = await verifiedUser(request.headers);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // Built per request so the agent closes over the verified user id; nothing client-supplied selects identity.
  const copilotRuntime = new CopilotRuntime({ agents: { [AGENT_ID]: chatAgent(user.id, request.signal) } });
  return createCopilotRuntimeHandler({ runtime: copilotRuntime, basePath: "/api/copilotkit" })(request);
}

export { handle as GET, handle as POST };
