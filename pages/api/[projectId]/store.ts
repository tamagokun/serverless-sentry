import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    console.log(req.body);
  }
}
