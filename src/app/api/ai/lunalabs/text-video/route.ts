export const maxDuration = 300;
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import LumaAI from "lumaai";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const { prompt, userid, aspect_ratio, loop } = await req.json();

    if (!userid || !prompt) {
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

    let generation = await client.generations
      .create({
        aspect_ratio: aspect_ratio || "16:9",
        prompt: prompt,
        loop: loop || false,
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
        return new Response("Generation failed", {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (!generation || !generation.assets) {
      throw new Error("Generation failed or assets are undefined.");
    }

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
