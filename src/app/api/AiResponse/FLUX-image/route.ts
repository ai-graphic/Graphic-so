export const maxDuration = 300;
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {

    //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      apiKey,
      temperature,
      maxTokens,
      num_outputs,
      aspect_ratio,
      output_format,
      guidance_scale,
      output_quality,
      num_inference_steps,
    } = await req.json();

    const replicate = new Replicate({
      auth: apiKey,
    });

    const guidanceScaleNumber = parseFloat(guidance_scale);
    const numInferenceStepsInt = parseInt(num_inference_steps, 10);
    const numOutputsInt = parseInt(num_outputs, 10);
    const outputQualityInt = parseInt(output_quality, 10);

    const output = await replicate.run(
      "lucataco/flux-dev-lora:94a0c19e55e36f75d657ecf9eada9f16a233b5329fb9cdf8e2b9ecd093e5c97e",
      {
        input: {
          prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
          temperature: temperature || 0.5,
          aspect_ratio: aspect_ratio || "1:1",
          output_format: output_format || "webp",
          guidance_scale: guidanceScaleNumber || 3.5,
          num_inference_steps: numInferenceStepsInt || 20,
          num_outputs: numOutputsInt | 1,
          output_quality: outputQualityInt || 80,
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
