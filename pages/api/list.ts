import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // TODO check token
  const data = await db.query.project.findMany();

  return res.json({ data });
}
