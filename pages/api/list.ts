import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // TODO check token

  const projects = await prisma.project.findMany();

  return res.json({ data: projects });
}
