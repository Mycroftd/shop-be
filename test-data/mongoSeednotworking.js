const fs = require("fs");
const mongoose = require("mongoose");
const CategorySchema = require("../db/shopCategoriesModel");
const ProductsSchema = require("../db/productsModel");

const categoryJson = JSON.parse(
  fs.readFileSync(__dirname + "/categories/categories.json")
);
const productJson = JSON.parse(
  fs.readFileSync(__dirname + "/products/products.json")
);

const newCategory = new CategorySchema({
  name: "dave",
});

const seed = async () => {
  await mongoose.connection.dropCollection("products");
  await mongoose.connection.dropCollection("categories");
  await newCategory.save();
  await CategorySchema.create({});
  await ProductsSchema.create({});
  return;
};

module.exports = seed;
