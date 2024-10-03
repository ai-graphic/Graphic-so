"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onPaymentDetails = async () => {
  //TODO: Can wrap around try catch for better error handling
  const user = await currentUser();
  
  if (user) {
    const connection = await db.user.findFirst({
      where: {
        clerkId: user.id,
      },
      select: {
        tier: true,
        credits: true,
      },
    });

    if (user) {
      return connection;
    }
  }
};

export const updateCredits = async () => {
  const user = await currentUser();

  if (user) {
    const dbUser = await db.user.findFirst({
      where: {
        clerkId: user.id,
      },
    });
    const newCredit = (Number(dbUser?.credits) - 1).toString();

    await db.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        credits: newCredit,
      },
    });
    return newCredit;
  }
};
