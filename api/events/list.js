const { parse } = require("url");

module.exports = async (req, res) => {
  const { pathname } = parse(req.url, true);
  const [_, projectId] = pathname.split("/");

  // fetch events based on project id
  // return list
};
