# 1 — Ask the assistant to rename the current chat

Ticket: https://github.com/thanghokdps/chat-bot/issues/1 · Opened by: thanghokdps · Read: 2026-10-27

## The ticket (verbatim)

> ## Story
>
> As a signed-in user, I can ask the assistant in the chat to rename the current conversation (e.g. "call this chat Q4 planning"), so I don't have to find it in the sidebar.
>
> ## Acceptance criteria
>
> - The assistant proposes the new title and asks me to confirm before changing anything (confirm card; Cancel leaves the title unchanged).
> - On confirm, the title changes and the sidebar shows the new title without a reload.
> - Titles follow the existing rule: trimmed, 1–80 characters. An invalid title gets a clear reply, not an error.
> - The assistant can only rename the conversation the user is in, and only one the user owns.
> - Works at phone width (375) and desktop (1920).
>
> ## Notes
>
> - Reuse `renameConversation` (src/server/conversations/repository.ts) and `renameSchema`; sidebar rename already exists.

## Outcome

- User: a signed-in user in an open conversation.
- Outcome: they can rename that conversation by asking the assistant, confirming the proposed title on a card.
