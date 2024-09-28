export const maxDuration = 300;

import { db } from "@/lib/db";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email_addresses, first_name, image_url } = body?.data;

    const email = email_addresses[0]?.email_address;
    console.log("✅", body);

    // const response = await axios.post(
    //   "https://api.spaceship.im/api/v1/api-users",
    //   {
    //     email: email,
    //     firstName: first_name,
    //     lastName: first_name,
    //     company: "Na",
    //     anonymousId: id,
    //   }
    // );
    await db.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name: first_name,
          profileImage: image_url,
        },
        create: {
          clerkId: id,
          email,
          name: first_name || "",
          profileImage: image_url || "",
          // superAgentAPI: response.data.data.token,
        },
      });
  

    return new NextResponse("User updated in database successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating database:", error);
    return new NextResponse("Error updating user in database", { status: 500 });
  }
}
