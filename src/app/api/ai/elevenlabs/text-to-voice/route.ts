export const maxDuration = 300;
import { db } from "@/lib/db";
import { ElevenLabsClient, ElevenLabs } from "elevenlabs";
import { v2 as cloudinary } from "cloudinary";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const { prompt, voice, userid, stability, similarity_boost, style } =
      await req.json();

    if (!userid && !prompt) {
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
    const client = new ElevenLabsClient({});

    const createAudioFileFromText = async (text: string, voice: string): Promise<string> => {
      return new Promise<string>(async (resolve, reject) => {
        try {
          const audio = await client.generate({
            voice: voice,
            model_id: "eleven_turbo_v2",
            text,
            voice_settings: {
                stability: stability || 0.1,
                similarity_boost: similarity_boost || 0.3,
                style: style || 0.2
            }        
          });
          const fileName = `${uuid()}.mp3`;

          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true, 
          });

          const cloudinaryStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "video",
              public_id: `audio_files/${fileName}`,
            },
            (error, result) => {
              if (error) {
                console.error("Error uploading stream to Cloudinary:", error);
                reject(error);
              } else {
                resolve(result?.url ?? ""); // This is the URL of the uploaded file
              }
            }
          );

          audio.pipe(cloudinaryStream);
        } catch (error) {
          reject(error);
        }
      });
    };

    const audio = await createAudioFileFromText(prompt, voice);
    if (!audio) {
      return new Response("Error generating audio", {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("Flux output :", audio);

    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 1).toString(),
      },
    });

    const finaloutput = JSON.stringify(audio);
    return new Response(finaloutput, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error during fal API call:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
