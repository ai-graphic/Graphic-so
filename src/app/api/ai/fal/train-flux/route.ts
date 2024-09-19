export const maxDuration = 300;
import { db } from "@/lib/db";
import * as fal from "@fal-ai/serverless-client";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      images_data_url,
      userid,
      trigger_word,
      iter_multiplier,
    } = await req.json();

    if (!userid) {
      return new Response("User is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

   const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      }
    })

    if (Number(dbUser?.credits) < 60) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        images_data_url: images_data_url,
        trigger_word: trigger_word,
        iter_multiplier: iter_multiplier || 1,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 60).toString(),
      },
    });

    console.log("Flux output :", result);
    const finaloutput = JSON.stringify(result);
    return new Response(finaloutput, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during Replicate API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
