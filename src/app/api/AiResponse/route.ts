
export const maxDuration = 300;
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  try {
    const { prompt, apiKey } = await req.json();
    const replicate = new Replicate({
        auth: apiKey,
      });
    const output = await replicate.run(
      "lucataco/flux-dev-lora:d8773e816f78c40a77da50bb702ffd9ff2deca137a32801cbf84eb3cd642fa12",
      {
        input: {
            prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
        },
      }
    );
    console.log(output);
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
