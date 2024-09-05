import { db } from "@/lib/db";

export const getAllWorkflows = async () => {
  const workflow = await db.workflows.findMany();
  return workflow;
};
