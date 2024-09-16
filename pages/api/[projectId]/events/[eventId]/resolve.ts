import { NextApiRequest, NextApiResponse } from "next";
import { db, schema } from "../../../../../db";
import { and, eq } from "drizzle-orm";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") {
    return res.status(405).end();
  }
  // TODO check token

  const { projectId, eventId } = req.query;

  await db
    .update(schema.event)
    // @ts-ignore
    .set({ resolvedAt: new Date().toISOString() })
    .where(
      and(
        eq(schema.event.id, String(eventId)),
        eq(schema.event.projectId, Number(projectId))
      )
    );

  return res.json({ success: true });
}
