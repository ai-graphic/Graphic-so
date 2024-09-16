export const maxDuration = 300;
import { db } from "@/lib/db";
import * as fal from "@fal-ai/serverless-client";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      image_size,
      userid,
      num_inference_steps,
      guidance_scale,
      num_images,
      seed,
      enable_safety_checker,
      sync_mode,
    } = await req.json();

    if (!userid) {
      return new Response("API key and prompt is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      }
    })

    if (Number(dbUser?.credits) < 1) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    const guidanceScaleNumber = parseFloat(guidance_scale);
    const numInferenceStepsInt = parseInt(num_inference_steps, 10);
    interface FalResult {
      images: { url: string }[];
    }

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        image_size: image_size || "landscape_4_3",
        num_inference_steps: numInferenceStepsInt || 28,
        guidance_scale: guidanceScaleNumber || 3.5,
        num_images: num_images || 1,
        enable_safety_checker: enable_safety_checker || false,
        seed: seed || 0,
        sync_mode: sync_mode || true,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    }) as FalResult;

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

    const uploadurl = result.images[0].url;
    const uploadResult = await cloudinary.uploader
      .upload(uploadurl, {
        public_id: `fluxaisssdd_${Date.now()}`,
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
