export const maxDuration = 300;
import { db } from "@/lib/db";
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
      userid,
      motion_bucket_id,
      fps,
      cond_aug,
    } = await req.json();

    if (!userid) {
      return new Response("User is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

   const dbUser = await db.user.findFirst({
      where: {
        clerkId: userid,
      }
    })

    if (Number(dbUser?.credits) < 10) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    const fpsInt = parseInt(fps, 10);
    const motion_bucket_idInt = parseInt(motion_bucket_id, 10);
    const cond_augInt = parseFloat(cond_aug);

    const result = await fal.subscribe("fal-ai/stable-video", {
      input: {
        image_url: image_url,
        fps: fpsInt || 25,
        motion_bucket_id: motion_bucket_idInt || 127,
        cond_aug : cond_augInt ||  0.02,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    }) as FalResult;

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
    console.error("Error during fal API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
