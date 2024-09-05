export const maxDuration = 300;
import * as fal from "@fal-ai/serverless-client";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      image_url,
      apiKey,
      motion_bucket_id,
      fps,
      cond_aug,
    } = await req.json();

    fal.config({
      credentials: apiKey,
    });

    const result = await fal.subscribe("fal-ai/stable-video", {
      input: {
        image_url: image_url,
        fps: fps || 25,
        motion_bucket_id: motion_bucket_id || 127,
        cond_aug : cond_aug || 0.02,
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
