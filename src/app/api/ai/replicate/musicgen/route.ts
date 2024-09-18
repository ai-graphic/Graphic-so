export const maxDuration = 300;
import { db } from "@/lib/db";
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      userid,
      seed,
      top_k,
      top_p,
      duration,
      input_audio,
      temperature,
      continuation,
      model_version,
      continuation_start,
      multi_band_diffusion,
      normalization_strategy,
      classifier_free_guidance,
    } = await req.json();

    if (!userid && !prompt) {
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

    const Parsedtop_k = parseInt(top_k, 10);
    const Parsedtop_p = parseInt(top_p, 10);
    const parsedDuration = parseInt(duration, 10);
    const guidanceScaleNumber = parseFloat(classifier_free_guidance);
    const temp = parseInt(temperature, 10);
    const continuation_startInt = parseInt(continuation_start, 10);

    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          prompt: prompt,
          seed: seed || 42,
          top_k: Parsedtop_k || 250,
          top_p: Parsedtop_p || 0,
          duration: parsedDuration || 8,
          ...(input_audio && { input_audio }),
          temperature: temp || 1,
          continuation: continuation || false,
          model_version: model_version || "stereo-large",
          output_format: "mp3",
          continuation_start: continuation_startInt || 0,
          multi_band_diffusion: multi_band_diffusion || false,
          normalization_strategy: normalization_strategy || "peak",
          classifier_free_guidance: guidanceScaleNumber || 3,
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
