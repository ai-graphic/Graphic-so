import axios from "axios";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
export const maxDuration = 300;

export async function POST(req: Request, res: Response) {
    try {
      const { name, description, type, metadata } = await req.json();
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
      const url = `https://api.spaceship.im/api/v1/tools`;
      const options = {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${dbUser?.superAgentAPI}`,
        },
        timeout: 5000, 
      };
      const data = {
        name: name,
        description: description,
        type: type,
        metadata: "",
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
  