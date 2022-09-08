const { parse } = require("url");
const db = require("../db");

module.exports = async (req, res) => {
  const { pathname } = parse(req.url, true);
  const [_, projectId] = pathname.split("/");

  const events = await db
    .query({
      TableName: "sentry",
      KeyConditionExpression: "projectId = :i",
      ExpressionAttributeValues: { ":i": projectId }
    })
    .promise();

  res.status(200).json(events);
};
