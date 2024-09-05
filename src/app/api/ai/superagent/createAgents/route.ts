import axios from "axios";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {
  const maxAttempts = 3; // Maximum number of attempts
  let attempt = 0;
  let response;

  while (attempt < maxAttempts) {
    try {
      const {
        name, description, initialMessage, prompt, llmProvider, llmModel, workflowId
      } = await req.json();
      const { userId } = auth();
      if (!userId) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const dbUser = await db.user.findFirst({
        where: {
          clerkId: userId ,
        },
      });
      

      const url = `https://api.spaceship.im/api/v1/agents`;
      const data = {
          name: name,
          description: description,
          initialMessage: initialMessage,
          prompt: prompt,
          llmProvider: llmProvider || "OPENAI",
          llmModel: llmModel || "GPT_4_O"
      };
      const options = {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${dbUser?.superAgentAPI}`,
          },
      };

      response = await axios.post(url, data, options);
      if (response.status === 200) { // Assuming 200 is the success status code
        const final = JSON.stringify(response.data);
        console.log("final", final);
        return new Response(final, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
    }
  }
  console.error("Error during Superagent API call after 3 attempts");
  return new Response("error", {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}