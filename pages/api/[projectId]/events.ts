import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // TODO check token

  const { projectId, pageSize = 50, page = 1 } = req.query;

  const events = await prisma.event.findMany({
    where: {
      projectId: Number(projectId),
    },
    orderBy: {
      lastEventAt: "desc",
    },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  });

  return res.json({ data: events });
}
