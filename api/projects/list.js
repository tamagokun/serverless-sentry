const { parse } = require("url");
const db = require("../db");

module.exports = async (req, res) => {
  const projects = await db
    .query({
      TableName: "sentry-project"
    })
    .promise();

  res.status(200).json(projects);
};
