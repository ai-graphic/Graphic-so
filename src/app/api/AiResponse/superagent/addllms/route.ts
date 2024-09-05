import axios from "axios";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
export const maxDuration = 300;
export async function POST(req: Request, res: Response) {
  try {
    const { agentId, llmId } = await req.json();
if (!agentId || !llmId) {
      return new Response("Missing agentId or llmid", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userId,
      },
    });
    const agenturl = `https://api.spaceship.im/api/v1/agents/${agentId}`;

    const url = `https://api.spaceship.im/api/v1/agents/${agentId}/llms`;
    const options = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
      },
    };

    try {
      const response = await axios.get(agenturl, options);
      console.log("response", response.data);
      const llms = response.data.data.llms;
      console.log("llms", llms);
      if (llms && Array.isArray(llms)) {
        for (const llm of llms) {
          try {
            await axios.delete(`https://api.spaceship.im/api/v1/agents/${agentId}/llms/${llm.llmId}`, options);
          } catch (deleteError) {
            console.error(`Error deleting LLM with ID ${llm.llmId}:`, deleteError);
          }
        }
      } else {
        console.error("LLMs data is not an array:", llms);
        return new Response("error processing LLMs data", {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (getError) {
      console.error("Error fetching agent data:", getError);
      return new Response("error fetching agent data", {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const addllmresponse = await axios.post(url, {
        llmId: llmId
      }, options);
      return new Response("success", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (postError) {
      console.error("Error adding LLM:", postError);
      return new Response("error adding LLM", {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
