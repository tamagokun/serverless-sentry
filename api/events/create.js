const { json } = require("micro");

module.exports = async (req, res) => {
  const body = await json(req);

  // rate-limit? do we need to?

  // store event
  // need to support sentry body
};
