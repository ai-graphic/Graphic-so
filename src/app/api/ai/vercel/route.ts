import { db } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, system, userid, model, maxTokens, temperature } =
    await req.json();

  if (!prompt || !userid) {
    return new Response("userid and prompt is required", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dbUser = await db.user.findFirst({
    where: {
      clerkId: userid,
    },
  });

  if (Number(dbUser?.credits) < 1) {
    return new Response("Insufficient credits", {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  type ModelType = "Openai" | "Claude";

  const modelMap = {
    Openai: openai("gpt-4-turbo"),
    Claude: anthropic("claude-3-5-sonnet-20240620"),
  };

  const selectedModel = modelMap[model as ModelType];
  if (!selectedModel) {
    return new Response("Invalid model specified", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await generateText({
    model: selectedModel,
    messages: [
      { role: "system", content: system ? `${system}` : "you are a friendly ai prompt generator" },
      { role: "user", content: `${prompt}` },
    ],
    temperature: temperature || 0.7,
    maxTokens: maxTokens || 100,
  });

  console.log(result.text);
  await db.user.update({
    where: {
      clerkId: userid,
    },
    data: {
      credits: (Number(dbUser?.credits) - 1).toString(),
    },
  });

  return new Response(JSON.stringify(result.text), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
