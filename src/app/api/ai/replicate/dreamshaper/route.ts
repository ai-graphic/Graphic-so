export const maxDuration = 300;
import { db } from "@/lib/db";
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      userid,
      image,
      num_outputs,
      negative_prompt,
      strength,
      guidance_scale,
      scheduler,
      num_inference_steps,
      upscale,
    } = await req.json();

    if (!userid && !prompt && !image) {
      return new Response("API key and prompt is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      },
    });

    if (Number(dbUser?.credits) < 1) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });

    const numOutputsInt = parseInt(num_outputs, 10);
    const upscaleInt = parseInt(upscale, 10);
    const strengthInt = parseFloat(strength);
    const guidance_scaleInt = parseFloat(guidance_scale);
    const num_inference_stepsInt = parseInt(num_inference_steps, 10);

    const output = await replicate.run(
      "mcai/dreamshaper-v6-img2img:c7959eb3a86c09b449dacc11ce8bba295fda466fc6935ab8709e35f4f48c980c",
      {
        input: {
          prompt: prompt,
          num_outputs: numOutputsInt | 1,
          upscale: upscaleInt || 2,
          image: image,
          negative_prompt: negative_prompt || "",
          strength: strengthInt || 0.5,
          guidance_scale: guidance_scaleInt || 7.5,
          scheduler: scheduler || "EulerAncestralDiscrete",
          num_inference_steps: num_inference_stepsInt || 30,
        },
      }
    );
    console.log("Flux output :", output);
    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 1).toString(),
      },
    });
    const finaloutput = JSON.stringify(output);
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
