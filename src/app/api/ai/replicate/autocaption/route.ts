export const maxDuration = 300;
import { db } from "@/lib/db";
import Replicate from "replicate";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const {
      userid,
      font,
      color,
      kerning,
      opacity,
      MaxChars,
      fontsize,
      translate,
      output_video,
      stroke_color,
      stroke_width,
      right_to_left,
      subs_position,
      highlight_color,
      video_file_input,
      transcript_file_input,
      output_transcript,
    } = await req.json();

    if (!userid && !video_file_input) {
      return new Response("API key and video_file_input is required", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("userid", userid, "video_file_input", video_file_input);
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

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });

    const input: {
      font: any;
      color: any;
      kerning: any;
      opacity: any;
      MaxChars: any;
      fontsize: any;
      translate: any;
      output_video: any;
      stroke_color: any;
      stroke_width: any;
      right_to_left: any;
      subs_position: any;
      highlight_color: any;
      video_file_input: any;
      output_transcript: any;
      transcript_file_input?: any;
    } = {
      font: font || "Poppins/Poppins-ExtraBold.ttf",
      color: color || "white",
      kerning: kerning || -5,
      opacity: opacity || 0,
      MaxChars: MaxChars || 20,
      fontsize: fontsize || 7,
      translate: translate || false,
      output_video: output_video || true,
      stroke_color: stroke_color || "black",
      stroke_width: stroke_width || 2.6,
      right_to_left: right_to_left || false,
      subs_position: subs_position || "bottom75",
      highlight_color: highlight_color || "yellow",
      video_file_input: video_file_input,
      output_transcript: output_transcript || true,
    };
    if (transcript_file_input && transcript_file_input !== "") {
      input.transcript_file_input = transcript_file_input;
    }

    const output = (await replicate.run(
      "fictions-ai/autocaption:18a45ff0d95feb4449d192bbdc06b4a6df168fa33def76dfc51b78ae224b599b",
      {
        input,
      }
    )) as any;
    console.log("Flux output :", output);
    await db.user.update({
      where: {
        clerkId: userid,
      },
      data: {
        credits: (Number(dbUser?.credits) - 1).toString(),
      },
    });
    const finaloutput = JSON.stringify(output[0]);
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
