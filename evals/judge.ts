import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { cheapModel } from "@/agent/models";

const verdictSchema = z.object({ pass: z.boolean(), reason: z.string() });
export type Verdict = z.infer<typeof verdictSchema>;

/** LLM judge on the cheap model (ADR 0001 Q9): grades one answer against one case's criteria. */
export async function judge({
  conversation,
  answer,
  criteria,
}: {
  conversation: string;
  answer: string;
  criteria: string;
}): Promise<Verdict> {
  const model = cheapModel().withStructuredOutput(verdictSchema, { name: "verdict" });
  return model.invoke([
    new SystemMessage(
      "You grade a chatbot answer against criteria. Pass only if every criterion is met. Reply with pass and a one-sentence reason.",
    ),
    new HumanMessage(
      `Conversation so far (the answer replies to its last message):\n${conversation}\n\nAnswer:\n${answer}\n\nCriteria:\n${criteria}`,
    ),
  ]);
}
