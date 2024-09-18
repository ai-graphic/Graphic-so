import { db } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { BingClient } from '@agentic/bing'
import { anthropic } from "@ai-sdk/anthropic";
import { createAISDKTools } from '@agentic/ai-sdk'

export const maxDuration = 300;


export async function POST(req: Request) {
  const { prompt, system, userid, model, maxTokens, temperature } =
    await req.json();

  if (!prompt || !userid) {
    return new Response("userid and prompt is required", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log("prompt", prompt, "system", system, "userid", userid);

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

  const bing = new BingClient()



  const temp = parseFloat(temperature);
  const max_tokens = parseInt(maxTokens);
  const result = await generateText({
    model: selectedModel,
    // tools: createAISDKTools(bing),
    system: system || "you are a prompt enhancer",
    prompt: prompt,
    temperature: temp || 0.7,
    maxTokens: max_tokens || 100,
  });

/* The line `// console.log(result.toolResults[0])` is a commented-out console log statement in the
code. It is currently not active because it is preceded by `//`, which makes it a comment in the
TypeScript code. */
  // console.log(result.toolResults[0])
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
