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
      "lucataco/flux-dev-lora:d8773e816f78c40a77da50bb702ffd9ff2deca137a32801cbf84eb3cd642fa12",
      {
        input: {
          prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
          temperature: temperature,
          max_tokens: maxTokens,
          aspect_ratio: aspect_ratio,
          output_format: output_format,
          guidance_scale: guidanceScaleNumber,
          num_inference_steps: numInferenceStepsInt,
          num_outputs: numOutputsInt,
          output_quality: outputQualityInt,
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
