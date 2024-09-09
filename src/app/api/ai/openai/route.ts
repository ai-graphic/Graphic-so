import { db } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, system, userid } = await req.json();

  if (!userid) {
    return new Response("API key and prompt is required", {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
 const dbUser = await db.user.findFirst({
    where: {
      clerkId: userid,
    }
  })

  if (Number(dbUser?.credits) < 1) {
    return new Response("Insufficient credits", {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await generateText({
    model: openai("gpt-4-turbo"),
    messages: [
      { role: "system", content: `${system}` },
      { role: "user", content: `${prompt}` },
    ],
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
