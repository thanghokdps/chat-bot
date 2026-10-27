import { planLimits, subscriptions, userSettings } from "./accounts";
import { account, session, user, verification } from "./auth";
import { attachments, conversations, messageFeedback, messages } from "./chat";
import { promptSuggestions, suggestionCategories } from "./suggestions";

export { BACKGROUNDS, type Background } from "@/lib/backgrounds";
export * from "./accounts";
export * from "./auth";
export * from "./chat";
export * from "./suggestions";

export const tables = {
  user,
  session,
  account,
  verification,
  userSettings,
  planLimits,
  subscriptions,
  conversations,
  messages,
  attachments,
  messageFeedback,
  suggestionCategories,
  promptSuggestions,
};
