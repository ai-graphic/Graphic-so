export const maxDuration = 300;
import * as fal from "@fal-ai/serverless-client";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      image_size,
      apiKey,
      num_inference_steps,
      guidance_scale,
      num_images,
      seed,
      enable_safety_checker,
      loras,
      sync_mode,
      output_format,
    } = await req.json();

    fal.config({
      credentials: apiKey,
    });

    const guidanceScaleNumber = parseFloat(guidance_scale);
    const numInferenceStepsInt = parseInt(num_inference_steps, 10);

    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: prompt,
        image_size: image_size || "landscape_4_3",
        num_inference_steps: numInferenceStepsInt || 28,
        guidance_scale: guidanceScaleNumber || 3.5,
        num_images: num_images || 1,
        enable_safety_checker: enable_safety_checker || false,
        seed: seed || 0,
        loras : loras || "",
        sync_mode : sync_mode || true,
        output_format : output_format || "jpeg",
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
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