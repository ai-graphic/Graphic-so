// @ts-nocheck

"use server";
import "server-only";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { nanoid } from "@/lib/utils";
import { z } from "zod";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { TextContentDisplay } from "@/components/ui/TextCard";
import axios from "axios";
import { ImageContentDisplay } from "@/components/ui/imageCard";
import { db } from "./db";
import { onUpdateChatHistory } from "@/app/(main)/(pages)/workflows/_actions/worflow-connections";
import { SpinnerMessage } from "@/components/ui/Spinner";

async function submitUserMessage(
  content: string,
  userid: string,
  workflowId: string
) {
  "use server";

  const aiState = getMutableAIState();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content: content,
      },
    ],
  });

  const history = aiState.get().messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const latestUserMessage =
    aiState
      .get()
      .messages.filter((message) => message.role === "user")
      .slice(-1)[0]?.content || "";

  const textStream = createStreamableUI("");
  const uiStream = createStreamableUI();
  const spinnerStream = createStreamableUI(<SpinnerMessage />);
  const messageStream = createStreamableUI(null);

  (async () => {
    try {
      const result = await streamText({
        model: openai("gpt-3.5-turbo"),
        temperature: 0,
        tools: {
          workflowRun: {
            description: 'Run the workflow tool"',
            parameters: z.object({}),
          },
        },
        system: `\
        You are required to run the workflowRun tool whenever you receive a message starting with '/'. otherwise talk to the user normally, you are a ai for calling the workflows the user has created..
        `,
        messages: [...history],
      });
      console.log(result);
      let textContent = "";
      spinnerStream.done(null);
      let responded = false;
      for await (const delta of result.fullStream) {
        const { type } = delta;
        if (type === "text-delta") {
          const { textDelta } = delta;

          textContent += textDelta;
          console.log(textContent);
          messageStream.update(<TextContentDisplay content={textContent} />);

          aiState.update({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: "assistant",
                content: textContent,
              },
            ],
          });
        } else if (type === "tool-call") {
          const { toolName } = delta;
          console.log(toolName);

          if (toolName === "workflowRun") {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/api/workflow`,
              {
                workflowId: workflowId,
                prompt: latestUserMessage,
                userid: userid,
              }
            );

            textContent = response.data;
            console.log("data", textContent);

            if (textContent.startsWith("http")) {
              textStream.update(<ImageContentDisplay url={textContent} />);
            } else {
              textStream.update(<TextContentDisplay content={textContent} />);
            }

            aiState.update({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: "assistant",
                  content: textContent,
                },
              ],
            });
            await onUpdateChatHistory(
              workflowId,
              aiState
                .get()
                .messages.filter((message) => message.role === "user")
            );

            // Push the assistant message
            await onUpdateChatHistory(
              workflowId,
              aiState
                .get()
                .messages.filter((message) => message.role === "assistant")
            );

            // Save spinner and display in the chat history
            await onUpdateChatHistory(
              workflowId,
              aiState.get().messages.map((message) => ({
                ...message,
                spinner: spinnerStream.value,
                display: messageStream.value,
              }))
            );

            if (textContent.startsWith("http")) {
              messageStream.update(<ImageContentDisplay url={textContent} />);
            } else {
              messageStream.update(
                <TextContentDisplay content={textContent} />
              );
            }
            responded = true;
          }
        }
      }

      uiStream.done();
      textStream.done();
      messageStream.done();
    } catch (e) {
      console.error(e);

      const error = new Error(
        "The AI got rate limited, please try again later."
      );
      uiStream.error(error);
      textStream.error(error);
      messageStream.error(error);
      aiState.done();
    }
  })();

  return {
    id: nanoid(),
    role: "assistant",
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value,
  };
}

export type Message = {
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  id?: string;
  name?: string;
  display?: {
    name: string;
    props: Record<string, any>;
  };
};

export type AIState = {
  chatId: string;
  interactions?: string[];
  messages: Message[];
};

export type UIState = {
  id: string;
  role: "user" | "assistant";
  display: React.ReactNode;
  spinner?: React.ReactNode;
  attachments?: React.ReactNode;
}[];

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), interactions: [], messages: [] },
});
