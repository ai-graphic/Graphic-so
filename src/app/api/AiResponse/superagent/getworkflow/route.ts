import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

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
export async function POST(req: Request, res: Response) {
  try {
    const { workflowId } = await req.json();
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userId ?? "",
      },
    });


    const url = `https://api.spaceship.im/api/v1/workflows/${workflowId}`;
    const options = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${dbUser?.superAgentAPI}`,
      },
    };
    // Usage inside your POST function
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
