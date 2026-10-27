import { CircleArrowOutDownRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ICON_SIZE } from "@/components/ui/icon";
import type { ThreadMessageDto } from "@/lib/types";
import { AnswerToolbar } from "./answer-toolbar";
import type { ThreadProps } from "./thread";

export function AnswerBlock({
  answer,
  isLast,
  isRunning,
  onRegenerate,
  onRate,
}: {
  answer: ThreadMessageDto | null;
  isLast: boolean;
  isRunning: boolean;
  onRegenerate: ThreadProps["onRegenerate"];
  onRate: ThreadProps["onRate"];
}) {
  const isStreaming = isLast && isRunning;
  const isThinking = isStreaming && (!answer || answer.content.length === 0);

  return (
    <div className="min-w-0 @xl:pl-9">
      <p className="mt-2.75 flex items-center gap-1 text-13 text-primary italic">
        CHAT A.I + <CircleArrowOutDownRight size={ICON_SIZE.xs} strokeWidth={1.6} aria-hidden />
      </p>
      {isThinking ? (
        <p aria-label="CHAT A.I+ is thinking" className="mt-2.5 flex h-7 items-center gap-1.25">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.75 rounded-full bg-primary"
              style={{ animation: `dot-pulse 1.2s ${i * 0.15}s infinite` }}
            />
          ))}
        </p>
      ) : (
        answer && (
          <div
            aria-live={isStreaming ? "polite" : undefined}
            className={`answer-markdown mt-1.5 text-16 leading-6.5 tracking-answer @3xl:text-answer @3xl:leading-7 ${answer.status === "error" ? "text-danger" : "text-ink-2"} ${isStreaming ? "streaming-caret" : ""}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.content}</ReactMarkdown>
          </div>
        )
      )}
      {answer && !isStreaming && (
        <AnswerToolbar answer={answer} isRunning={isRunning} onRegenerate={onRegenerate} onRate={onRate} />
      )}
    </div>
  );
}
