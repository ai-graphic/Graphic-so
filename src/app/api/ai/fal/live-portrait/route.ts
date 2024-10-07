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
      video_url,
      image_url,
      blink,
      eyebrow,
      wink,
      pupil_x,
      pupil_y,
      aaa,
      eee,
      woo,
      smile,
      flag_lip_zero,
      flag_stitching,
      flag_relative,
      flag_pasteback,
      flag_do_crop,
      flag_do_rot,
      dsize,
      scale,
      vx_ratio,
      vy_ratio,
      batch_size,
      enable_safety_checker,
      // Keep the existing parameters
    } = await req.json();


    // default value handle
    if (!userid || !video_url || !image_url ) {
      return new Response("API key, video url and image url is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      },
    });

    if (Number(dbUser?.credits) < 10) {
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

 
    const result = (await fal.subscribe("fal-ai/live-portrait", {
      input: {
        video_url:video_url,
        image_url:image_url,

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
        credits: (Number(dbUser?.credits) - 10).toString(),
      },
    });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true, 
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

    if (uploadResult && uploadResult.secure_url) {
      const finalurl = [uploadResult.secure_url];
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
