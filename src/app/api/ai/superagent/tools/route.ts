import axios from "axios";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
export const maxDuration = 300;

async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3,
  backoff = 300
) {
  try {
    const response = await axios.get(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    } else throw error;
  }
}
export async function GET(req: Request, res: Response) {
  try {
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
    
    const url = `https://api.spaceship.im/api/v1/tools?skip=0&take=5`;
    const options = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
      },
    };
    const response = await fetchWithRetry(url, options);
    const final = JSON.stringify(response.data);
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

export async function POST(req: Request, res: Response) {
  try {
    const { toolId, agentId } = await req.json();
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
    
    
    const url = `https://api.spaceship.im/api/v1/agents/${agentId}/tools`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    };
    const data = {
        "toolId": toolId
      }
    const response = await axios.post(url, data, options);
    const final = JSON.stringify(response.data);
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
