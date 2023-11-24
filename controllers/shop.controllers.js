const {
  findAllCategories,
  findAllProducts,
  findACategory,
  findAProduct,
  saveAProduct,
  saveCategory,
  findSaveRating,
} = require("../models/shop.models");

exports.getAllCategories = async (req, res, next) => {
  findAllCategories().then((categories) => {
    res.status(200).send({ categories });
  });
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, sortby, order } = req.query;

    const sortbyGreenList = [
      "title",
      "price",
      "description",
      "category",
      "rating.rate",
      "rating.count",
    ];

    if (sortby && !sortbyGreenList.includes(sortby)) {
      res.status(400).send({ msg: "invalid sort by" });
      return;
    }

    const promises = [findAllProducts(category, sortby, order)];

    if (category) promises.push(findACategory(category));

    const [products] = await Promise.all(promises);

    res.status(200).send({ products });
  } catch (err) {
    next(err);
  }
};

exports.getAProductById = async (req, res, next) => {
  try {
    const id = req.params.product_id;
    const product = await findAProduct(id);
    res.status(200).send({ product });
  } catch (err) {
    next(err);
  }
};

exports.addAProduct = async (req, res, next) => {
  try {
    const { title, price, description, category } = req.body;

    if (!title || !price || !description || !category) {
      res.status(400).send({ msg: "needs all data" });
      return;
    }

    const product = await saveAProduct(title, price, description, category);
    res.status(201).send({ product });
  } catch (err) {
    next(err);
  }
};

exports.addACategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).send({ msg: "needs all data" });
      return;
    }
    const category = await saveCategory(name);
    res.status(201).send({ category });
  } catch (err) {
    next(err);
  }
};

exports.patchCategory = async (req, res, next) => {
  try {
    const id = req.params.product_id;
    const { rate } = req.body;

    if (rate < 1 || rate > 5) {
      res.status(400).send({ msg: "rating must be between 1 and 5" });
      return;
    }

    const product = await findSaveRating(id, rate);

    if (product) res.status(200).send({ product });
  } catch (err) {
    next(err);
  }
};
