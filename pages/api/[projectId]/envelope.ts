import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  console.log("HEY");
  console.log(req.body);
  console.log(req.query);
}
