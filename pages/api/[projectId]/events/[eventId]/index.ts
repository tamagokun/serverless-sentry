import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../../db";
import { and, eq } from "drizzle-orm";
import { event } from "../../../../../db/schema";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // TODO check token

  const { projectId, eventId } = req.query;

  const data = await db.query.event.findFirst({
    where: and(
      eq(event.id, String(eventId)),
      eq(event.projectId, Number(projectId))
    ),
  });

  return res.json(data);
}
