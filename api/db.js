const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_DB_KEY,
    secretAccessKey: process.env.AWS_DB_SECRET
  }
});

const db = new AWS.DynamoDB();

module.exports = db;
