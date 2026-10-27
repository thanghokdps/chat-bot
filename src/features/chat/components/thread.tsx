import type { ReactNode } from "react";
import type { ThreadMessageDto, ViewerDto } from "@/lib/types";
import { AnswerBlock } from "./answer-block";
import { PromptLine } from "./prompt-line";

export interface ThreadProps {
  messages: ThreadMessageDto[];
  viewer: ViewerDto;
  isRunning: boolean;
  onEdit: (messageId: string, content: string) => void;
  onRegenerate: (messageId: string) => void;
  onRate: (messageId: string, rating: 1 | -1 | null) => void;
  /** Shown under the last exchange, inside the padding the composer overlaps. */
  children?: ReactNode;
}

export interface Exchange {
  prompt: ThreadMessageDto;
  answer: ThreadMessageDto | null;
}

/** Pairs each prompt with the reply that follows it on the visible branch. */
export function toExchanges(messages: ThreadMessageDto[]): Exchange[] {
  const out: Exchange[] = [];
  for (const m of messages) {
    if (m.role === "user") out.push({ prompt: m, answer: null });
    else {
      const last = out.at(-1);
      if (last && !last.answer) last.answer = m;
    }
  }
  return out;
}

export function Thread({ messages, viewer, isRunning, onEdit, onRegenerate, onRate, children }: ThreadProps) {
  const exchanges = toExchanges(messages);
  return (
    <div className="mx-auto w-full max-w-238 pt-3 pb-37.5 @3xl:pt-13.75 @3xl:pb-55">
      {exchanges.map((x, i) => (
        <article
          key={x.prompt.id}
          className={i > 0 ? "mt-7 border-t border-separator pt-7 @3xl:mt-9.5 @3xl:pt-9.5" : undefined}
        >
          <PromptLine prompt={x.prompt} viewer={viewer} isLocked={isRunning} onEdit={onEdit} />
          <AnswerBlock
            answer={x.answer}
            isLast={i === exchanges.length - 1}
            isRunning={isRunning}
            onRegenerate={onRegenerate}
            onRate={onRate}
          />
        </article>
      ))}
      {children}
    </div>
  );
}
