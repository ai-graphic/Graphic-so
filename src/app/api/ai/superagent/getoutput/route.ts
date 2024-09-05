import axios from "axios";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "@/lib/utils";

export const maxDuration = 300;
export async function POST(req: Request, res: Response) {

  try {
    const {
       prompt, workflowId, userid, history
    } = await req.json();
    console.log(prompt, workflowId, userid, history);
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      },
    });
    console.log(dbUser);
    console.log("prompt", history);
    const url = `https://api.spaceship.im/api/v1/workflows/${workflowId}/invoke`;
    let data;
    if (!history) {
      data = {
        input: prompt,
        sessionId: nanoid(),
        enableStreaming: false
      }
    } else {
       data = {
        input: prompt,
        enableStreaming: false
      }
    }
    const options = {
      headers: {
        accept: "application/json",
        'Content-Type': 'application/json', // Explicitly setting Content-Type
        Authorization:
        `Bearer ${dbUser?.superAgentAPI}`,
      },
      timeout: 30000,
    };
    const maxRetries = 3;
    let response;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await axios.post(url, data, options);
        break; // Exit loop if request is successful
      } catch (error: any) {
        if (attempt === maxRetries || !error.code || error.code !== 'ETIMEDOUT') {
          throw error; // Rethrow if max retries reached or error is not a timeout
        }
        console.warn(`Attempt ${attempt} failed. Retrying...`);
      }
    }
    const final = JSON.stringify(response?.data.data);
    return new Response(final, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
