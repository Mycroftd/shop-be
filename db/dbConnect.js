const mongoose = require("mongoose");
require("dotenv").config();

console.log(process.env.NODE_ENV);

let connection = process.env.DB_URL;
if (process.env.NODE_ENV === "development") connection = process.env.TEST_DB;

async function dbConnect() {
  mongoose
    .connect(connection, {})
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;
