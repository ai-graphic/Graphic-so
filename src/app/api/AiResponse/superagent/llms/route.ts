import axios from "axios";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
export const maxDuration = 300;

async function makeRequestWithRetry(url: string, data: any, options: any, retries: number = 3, delay: number = 1000): Promise<any> {
  try {
    return await axios.post(url, data, options);
  } catch (error: any) {
    if (retries > 0 && error.code === 'ETIMEDOUT') {
      console.warn(`Retrying request... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return makeRequestWithRetry(url, data, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function POST(req: Request, res: Response) {
  try {
    const { LLM, Apikey } = await req.json();
    console.log("LLM", LLM, Apikey);
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

    const url = `https://api.spaceship.im/api/v1/llms`;
    const options = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
        "Content-Type": "application/json",
      },
      timeout: 20000, // Set a timeout of 20 seconds
    };
    const data = {
      provider: LLM,
      apiKey: Apikey,
      options: {}
    };

    const response = await makeRequestWithRetry(url, data, options);
    const final = JSON.stringify(response.data);
    return new Response(final, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during Superagent API call:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ... existing code for GET function ...   

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
        clerkId: userId ,
      },
    });

    const url = `https://api.spaceship.im/api/v1/llms`;
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    };

    const response = await axios.get(url, options);
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
