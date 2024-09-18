export const maxDuration = 300;
import { db } from "@/lib/db";
import * as fal from "@fal-ai/serverless-client";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      userid,
      negative_prompt,
      num_inference_steps,
      guidance_scale,
      use_rife,
      export_fps,
      video_url,
      strength,
    } = await req.json();

    if (!userid || !prompt || !video_url) {
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

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    interface FalResult {
      video: { url: string };
    }

    const numInferenceStepsInt = parseInt(num_inference_steps, 10);
    const guidanceScaleNumber = parseFloat(guidance_scale);
    const exportFpsInt = parseInt(export_fps, 10);
    const strengthInt = parseFloat(strength);

    const result = (await fal.subscribe("fal-ai/cogvideox-5b/video-to-video", {
      input: {
        prompt: prompt,
        video_size: {
          height: 480,
          width: 720,
        },
        num_inference_steps: numInferenceStepsInt || 50,
        guidance_scale: guidanceScaleNumber || 7,
        negative_prompt: negative_prompt || "",
        use_rife: use_rife || true,
        export_fps: exportFpsInt || 30,
        video_url: video_url,
        strength: strengthInt || 0.5,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    })) as FalResult;

    console.log("Flux output :", result);
    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 1).toString(),
      },
    });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("result", result);
    const uploadurl = result.video.url;
    console.log("uploadurl", uploadurl);
    const uploadResult = await cloudinary.uploader
      .upload(uploadurl, {
        public_id: `fluxaisssdd_${Date.now()}`,
        resource_type: "video",
      })
      .catch((error) => {
        console.log(error);
      });

    if (uploadResult && uploadResult.url) {
      const finalurl = [uploadResult.url];
      const finaloutput = JSON.stringify(finalurl);

      return new Response(finaloutput, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Upload failed, no URL returned.");
    }
  } catch (error: any) {
    console.error("Error during fal API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
