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
      source_image_url,
      driven_audio_url,
      userid,
      face_model_resolution,
      expression_scale,
      face_enhancer,
      preprocess,
    } = await req.json();

    if (!userid && !source_image_url && !driven_audio_url) {
      return new Response("User and audio and image is missing", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log(
      userid,
      "source",
      source_image_url,
      "driven",
      driven_audio_url,
      face_model_resolution,
      expression_scale,
      face_enhancer,
      preprocess
    );
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

    const result = (await fal.subscribe("fal-ai/sadtalker", {
      input: {
        source_image_url: source_image_url,
        driven_audio_url: driven_audio_url,
        face_model_resolution: face_model_resolution || "256",
        expression_scale: expression_scale || 1,
        face_enhancer: face_enhancer || null,
        preprocess: preprocess || "crop",
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    })) as FalResult;

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

    const uploadurl = result.video.url;
    const uploadResult = await cloudinary.uploader
      .upload(uploadurl, {
        public_id: `sadtalker_${Date.now()}`,
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
    console.error("Error during fal API call:", error.body.detail);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
