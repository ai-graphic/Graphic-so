export const maxDuration = 300;
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import LumaAI from "lumaai";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      prompt,
      userid,
      start_frame_url,
      end_frame_url,
      aspect_ratio,
      loop,
    } = await req.json();

    if (!userid || !prompt || !start_frame_url) {
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

    if (Number(dbUser?.credits) < 10) {
      return new Response("Insufficient credits", {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY,
    });

    console.log("Flux input :", {
      prompt,
      start_frame_url,
      end_frame_url,
      aspect_ratio,
      loop,
    });
    const loopValue = loop === "on" ? true : false;
    const data: any = {
      aspect_ratio: aspect_ratio || "16:9",
      prompt: prompt,
      keyframes: {
        frame0: {
          type: "image",
          url: start_frame_url,
        },
      },
      loop: loopValue || false,
    };

    if (end_frame_url) {
      data.keyframes.frame1 = {
        type: "image",
        url: end_frame_url,
      };
    }

    let generation = await client.generations
      .create({
        ...data,
      })
      .catch(async (err) => {
        if (err instanceof LumaAI.APIError) {
          console.log(err.status);
          console.log(err.name);
          console.log(err.headers);
        } else {
          throw err;
        }
      });
    console.log("Flux output :", generation);

    while (
      generation &&
      generation.state &&
      (generation.state === "queued" || generation.state === "dreaming")
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (!generation.id) {
        throw new Error("Generation ID is undefined.");
      }
      generation = await client.generations.get(generation.id);
      console.log("Polling generation state:", generation.state);

      if (generation.state === "failed") {
        console.error("Generation failed:", generation.failure_reason);
        return new Response(generation.failure_reason, {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (!generation || !generation.assets) {
      throw new Error("Generation failed or assets are undefined.");
    }

    console.log("Flux output :", generation);

    console.log("Flux output :", generation);
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

    console.log("result", generation);
    if (!generation || !generation.assets) {
      throw new Error("Generation failed or assets are undefined.");
    }
    const uploadurl = generation.assets.video;
    console.log("uploadurl", uploadurl);
    if (!uploadurl || typeof uploadurl !== "string") {
      throw new Error("Invalid upload URL.");
    }
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
