export const maxDuration = 300;
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request, res: Response) {
  //TODO: Add security checks with clerk
  try {
    const { image } = await req.json(); // Extract image data from request
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await cloudinary.uploader
      .upload(image, {
        public_id: `uploaded${Date.now()}-${userId}`,
      })
      .catch((error) => {
        console.log(error);
      });

    if (uploadResult && uploadResult.url) {
      return new Response(JSON.stringify(uploadResult.url), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error("Upload failed, no URL returned.");
  } catch (error: any) {
    console.error("Error during Cloudinary upload:", error);
    return new Response("error", {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
