const express = require("express");
const cors = require("cors");
const app = express();
const dbConnect = require("./db/dbConnect");
dbConnect();

const {
  getAllCategories,
  getAllProducts,
  getAProductById,
  addAProduct,
  addACategory,
  patchCategory,
} = require("./controllers/shop.controllers");

const {
  customError,
  catch404Error,
  catch500Error
} = require("./controllers/errors.controller");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server Running!" });
});

app.get("/api/categories", getAllCategories);
app.get("/api/products", getAllProducts);
app.get("/api/products/:product_id", getAProductById);
app.post("/api/products", addAProduct);
app.post("/api/categories", addACategory);
app.patch("/api/products/:product_id", patchCategory);
app.use('/img', express.static(__dirname + '/savedPics'));

app.all("*", catch404Error);

app.use(customError);
app.use(catch500Error);

module.exports = app;
