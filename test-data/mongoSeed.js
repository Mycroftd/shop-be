const { Seeder } = require("mongo-seeding");
require("dotenv").config();
const path = require("path");
const CategorySchema = require("../db/shopCategoriesModel");
const ProductsSchema = require("../db/productsModel");

let connection = process.env.DB_URL;
if (process.env.NODE_ENV === "development") connection = process.env.TEST_DB;

const config = {
  database: connection,
};

const seeder = new Seeder(config);

const collections = seeder.readCollectionsFromPath(
  path.resolve(__dirname, "../test-data")
);

const seed = async () => {
  await CategorySchema.deleteMany({});
  await ProductsSchema.deleteMany({});
  await seeder.import(collections);
};

module.exports = seed;
