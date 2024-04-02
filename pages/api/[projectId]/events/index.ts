import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../db";
import { desc, eq } from "drizzle-orm";
import { event } from "../../../../db/schema";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // TODO check token

  const { projectId, pageSize = 50, page = 1 } = req.query;

  const data = await db.query.event.findMany({
    where: eq(event.projectId, Number(projectId)),
    orderBy: desc(event.lastEventAt),
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize),
  });

  return res.json({ data });
}
