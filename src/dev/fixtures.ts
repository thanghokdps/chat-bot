import type { ConversationItem, SuggestionColumnDto, ThreadMessageDto, ViewerDto } from "@/lib/types";

// Content copied from the Figma frames so screenshots can be diffed against them.

export const FIXTURE_VIEWER: ViewerDto = { name: "Andrew Neilson", image: "/brand/sample-avatar.png" };

const titles: [string, ConversationItem["group"]][] = [
  ["Create Html Game Environment...", "today"],
  ["Apply To Leave For Emergency", "today"],
  ["What Is UI UX Design?", "today"],
  ["Create POS System", "today"],
  ["What Is UX Audit?", "today"],
  ["Create Chatbot GPT...", "today"],
  ["How Chat GPT Work?", "today"],
  ["Crypto Lending App Name", "last7Days"],
  ["Operator Grammar Types", "last7Days"],
  ["Min States For Binary DFA", "last7Days"],
];

export const FIXTURE_CONVERSATIONS: ConversationItem[] = titles.map(([title, group], i) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  title,
  group,
  lastMessageAt: "2026-10-22T10:00:00.000Z",
}));

export const FIXTURE_ACTIVE_ID = FIXTURE_CONVERSATIONS[5]?.id ?? null;

export const FIXTURE_SUGGESTIONS: SuggestionColumnDto[] = [
  {
    slug: "explore",
    title: "Explore",
    description: "Learn how to use chat.ai platform for your needs",
    icon: "globe",
    cards: [
      {
        id: "s1",
        title: "“Explain”",
        prompt: "Quantum computing in simple terms”",
        imageUrl: "/suggestions/explain.png",
      },
      {
        id: "s2",
        title: "“How to”",
        prompt: "Make a search engine platform like google",
        imageUrl: "/suggestions/how-to.png",
      },
    ],
  },
  {
    slug: "capabilities",
    title: "Capabilities",
    description: "How much capable chat.ai to full-fill your needs",
    icon: "bolt",
    cards: [
      {
        id: "s3",
        title: "“Remember”",
        prompt: "quantum computing in simple terms”",
        imageUrl: "/suggestions/remember.png",
      },
      {
        id: "s4",
        title: "“Allows”",
        prompt: "User to provide follow-up corrections",
        imageUrl: "/suggestions/allows.png",
      },
    ],
  },
  {
    slug: "limitation",
    title: "Limitation",
    description: "How much capable chat.ai to full-fill your needs",
    icon: "warning",
    cards: [
      {
        id: "s5",
        title: "“May”",
        prompt: "Occasionally generate incorrect information",
        imageUrl: "/suggestions/may.png",
      },
      {
        id: "s6",
        title: "“ Limited”",
        prompt: "Knowledge of world and events after 2021",
        imageUrl: "/suggestions/limited.png",
      },
    ],
  },
];

const ANSWER = `Sure, I can help you get started with creating a chatbot using GPT in Python. Here are the basic steps you'll need to follow:

1. **Install the required libraries:** You'll need to install the transformers library from Hugging Face to use GPT. You can install it using pip.

2. **Load the pre-trained model:** GPT comes in several sizes and versions, so you'll need to choose the one that fits your needs. You can load a pre-trained GPT model. This loads the 1.3B parameter version of GPT-Neo, which is a powerful and relatively recent model.

3. **Create a chatbot loop:** You'll need to create a loop that takes user input, generates a response using the GPT model, and outputs it to the user. Here's an example loop that uses the input() function to get user input and the gpt() function to generate a response, This loop will keep running until the user exits the program or the loop is interrupted.

4. **Add some personality to the chatbot:** While GPT can generate text, it doesn't have any inherent personality or style. You can make your chatbot more interesting by adding custom prompts or responses that reflect your desired personality. You can then modify the chatbot loop to use these prompts and responses when appropriate. This will make the chatbot seem more human-like and engaging.

**These are just the basic steps to get started with a GPT chatbot in Python. Depending on your requirements, you may need to add more features or complexity to the chatbot. Good luck!**`;

const SECOND_ANSWER = `**Chatbots can be used for a wide range of purposes, including:**

Customer service chatbots can handle frequently asked questions, provide basic support, and help customers navigate a website, recommend products, track orders and much more.`;

function msg(
  id: string,
  role: "user" | "assistant",
  content: string,
  extra: Partial<ThreadMessageDto> = {},
): ThreadMessageDto {
  return { id, parentMessageId: null, role, content, status: "complete", rating: null, ...extra };
}

export const FIXTURE_THREAD: ThreadMessageDto[] = [
  msg("m1", "user", "Create a chatbot gpt using python language what will be step for that"),
  msg(
    "m2",
    "assistant",
    ANSWER.replace(/^Sure,[^\n]*/, (s) => `**${s}**`),
    { rating: 1 },
  ),
  msg("m3", "user", "What is use of that chatbot ?"),
  msg("m4", "assistant", SECOND_ANSWER),
];

export const FIXTURE_STREAMING: ThreadMessageDto[] = [
  msg("m1", "user", "Create a chatbot gpt using python language what will be step for that"),
  msg(
    "m2",
    "assistant",
    "**Sure, I can help you get started with creating a chatbot using GPT in Python.** Here are the",
    {
      status: "streaming",
    },
  ),
];

export const FIXTURE_RENAME: ThreadMessageDto[] = [
  ...FIXTURE_THREAD,
  msg("m5", "user", "call this chat Q4 planning"),
  msg("m6", "assistant", "Rename this chat to “Q4 planning”?"),
];

export const FIXTURE_THINKING: ThreadMessageDto[] = [msg("m1", "user", "What is use of that chatbot ?")];

export const FIXTURE_ERROR: ThreadMessageDto[] = [
  msg("m1", "user", "What is use of that chatbot ?"),
  msg("m2", "assistant", "Something went wrong while writing this answer. Please Regenerate.", { status: "error" }),
];
