"use client";

import type { Message } from "@ag-ui/core";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { Background, SuggestionColumnDto, ViewerDto } from "@/lib/types";
import { ChatApp } from "./chat-app";

// The server rebuilds history from the database, so only the newest message needs to travel.
function lastMessageOnly(messages: Message[]): Message[] {
  return messages.slice(-1);
}

export function AppShell(props: {
  viewer: ViewerDto;
  background: Background;
  plan: string;
  suggestions: SuggestionColumnDto[];
}) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
      messageFilter={lastMessageOnly}
      showDevConsole={false}
      enableInspector={false}
    >
      <ChatApp {...props} />
    </CopilotKitProvider>
  );
}
