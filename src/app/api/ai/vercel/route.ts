import { db } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { BingClient } from "@agentic/bing";
import { anthropic } from "@ai-sdk/anthropic";
import { createAISDKTools } from "@agentic/ai-sdk";
import { FirecrawlClient } from "@agentic/firecrawl";
import { z } from "zod";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { prompt, system, userid, model, maxTokens, temperature, tools } =
    await req.json();

  if (!prompt || !userid) {
    return new Response("userid and prompt is required", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log("prompt", prompt, "system", system, "userid", userid, "model", model, "maxTokens", maxTokens, "temperature", temperature, "tools", tools);

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
  const bing = new BingClient();
  const firecrawl = new FirecrawlClient();

  const toolMap = {
    "bing Search": createAISDKTools(bing),
    firecrawl: {
      firecrawl: tool({
        description:
          "scrape/get the data for a website with the url.",
        parameters: z.object({
          url: z.string().describe("The url to get the data for. / the url to scrape from."),
        }),
        execute: async ({ url }) => {
          console.log("URL received by firecrawl tool:", url); // Log the URL
          return {
            location: url,
            data: await firecrawl.scrapeUrl({ url: url }),
          };
        },
      }),
    },
  };
  const selectedModel = modelMap[model as ModelType];
  if (!selectedModel) {
    return new Response("Invalid model specified", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  type ToolType = "bing Search" | "firecrawl";

  const selectedTool = toolMap[tools as ToolType];
  console.log("selectedTool", selectedTool);

  const temp = parseFloat(temperature);
  const max_tokens = parseInt(maxTokens);

  const generateTextParams: any = {
    model: selectedModel,
    system: system || "you are a helpful assistant",
    prompt: prompt,
    temperature: temp || 0.7,
    maxTokens: max_tokens || 100,
    maxSteps: 2,
  };
  if (selectedTool) {
    generateTextParams.tools = selectedTool;
  }
  const result = await generateText(generateTextParams);

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
