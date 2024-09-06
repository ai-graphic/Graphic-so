export const maxDuration = 300;
import * as fal from "@fal-ai/serverless-client";
import { v2 as cloudinary } from "cloudinary";
interface FalResult {
  video: { url: string };
}

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

    if (!apiKey && !image_url) {
      return new Response("API key and prompt is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }


    fal.config({
      credentials: apiKey,
    });

    const result = await fal.subscribe("fal-ai/stable-video", {
      input: {
        image_url: image_url,
        fps: fps || 25,
        motion_bucket_id: motion_bucket_id || 127,
        cond_aug :  0.02,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    }) as FalResult;

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
        public_id: "fluxaisssdd",
        resource_type: "video",
      })
      .catch((error) => {
        console.log(error);
      })


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
    console.error("Error during Replicate API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
