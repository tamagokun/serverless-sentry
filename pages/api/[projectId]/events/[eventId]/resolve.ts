import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../../db";
import { and, eq } from "drizzle-orm";
import { event } from "../../../../../db/schema";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") {
    return res.status(405).end();
  }
  // TODO check token

  const { projectId, eventId } = req.query;

  await db
    .update(event)
    .set({ resolvedAt: new Date().toISOString() })
    .where(
      and(eq(event.id, String(eventId)), eq(event.projectId, Number(projectId)))
    );

  return res.json({ success: true });
}
