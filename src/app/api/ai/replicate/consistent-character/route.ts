export const maxDuration = 300;
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      apiKey,
      subject,
      num_outputs,
      negative_prompt,
      randomise_poses,
      number_of_outputs,
      disable_safety_checker,
      number_of_images_per_pose,
      output_format,
      output_quality,
    } = await req.json();

    if (!apiKey && !prompt && !subject) {
      return new Response("API key, prompt and subject is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const replicate = new Replicate({
      auth: apiKey,
    });

    const numOutputsInt = parseInt(num_outputs, 10);
    const outputQualityInt = parseInt(output_quality, 10);

    const output = await replicate.run(
      "fofr/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
      {
        input: {
          prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
          output_format: output_format || "webp",
          num_outputs: numOutputsInt | 1,
          output_quality: outputQualityInt || 80,
          subject: subject,
          negative_prompt: negative_prompt || "",
          randomise_poses: randomise_poses || false,
          number_of_outputs: number_of_outputs || 1,
          disable_safety_checker: disable_safety_checker || false,
          number_of_images_per_pose: number_of_images_per_pose || 1,
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
