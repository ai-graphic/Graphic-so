export const maxDuration = 300;
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      apiKey,
      image,
      num_outputs,
      negative_prompt,
      strength,
      guidance_scale,
      scheduler,
      num_inference_steps,
      upscale,
    } = await req.json();

    if (!apiKey && !prompt && !image) {
      return new Response("API key, prompt and image is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const replicate = new Replicate({
      auth: apiKey,
    });

    const numOutputsInt = parseInt(num_outputs, 10);
    const upscaleInt = parseInt(upscale, 10);

    const output = await replicate.run(
      "mcai/dreamshaper-v6-img2img:c7959eb3a86c09b449dacc11ce8bba295fda466fc6935ab8709e35f4f48c980c",
      {
        input: {
          prompt: prompt,
          num_outputs: numOutputsInt | 1,
          upscale: upscaleInt || 2,
          image: image,
          negative_prompt: negative_prompt || "",
          strength: strength || 0.5,
          guidance_scale: guidance_scale || 7.5,
          scheduler: scheduler || "EulerAncestralDiscrete",
          num_inference_steps: num_inference_steps || 30,
        },
      }
    );
    console.log("Flux output :", output);
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
