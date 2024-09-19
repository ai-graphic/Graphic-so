export const maxDuration = 300;
import { db } from "@/lib/db";
import * as fal from "@fal-ai/serverless-client";

interface FalResult {
  diffusers_lora_file: { url: string };
  config_file: { url: string };
}

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const { images_data_url, userid, trigger_word, iter_multiplier } =
      await req.json();

    if (!userid) {
      return new Response("User is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      },
    });

    if (Number(dbUser?.credits) < 60) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    const iter_multiplierInt = parseInt(iter_multiplier, 10);
    const result = (await fal.subscribe("fal-ai/flux/dev", {
      input: {
        images_data_url: images_data_url,
        trigger_word: trigger_word,
        create_masks: true,
        iter_multiplier: iter_multiplierInt || 1,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    })) as FalResult;

    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 60).toString(),
      },
    });

    console.log("Flux output :", result);
    const finaloutput =
      "diffusers_lora_file : " +
      result.diffusers_lora_file.url +
      "config_file : " +
      result.config_file.url;

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
