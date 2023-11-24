const CategorySchema = require("../db/shopCategoriesModel");
const ProductsSchema = require("../db/productsModel");

exports.findAllCategories = async () => {
  const allCates = await CategorySchema.find({}, { _id: 0 });
  return allCates;
};

exports.findACategory = async (category) => {
  const result = await CategorySchema.find({ name: category });
  if (result.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "category not found",
    });
  } else {
    return true;
  }
};

exports.findAllProducts = async (
  category,
  sortby = "rating.rate",
  order = 1
) => {
  try {
    const allProducts = await ProductsSchema.find(
      category ? { category } : {},
      { _id: 0 }
    ).sort({ [sortby]: parseInt(order) });
    return allProducts;
  } catch (err) {
    if (err.message.slice(0, 18) === "Invalid sort value")
      return Promise.reject({
        status: 400,
        msg: "invalid order",
      });
  }
};

exports.findAProduct = async (id) => {
  try {
    const product = await ProductsSchema.findOne({ id: parseInt(id) });
    if (!product)
      return Promise.reject({
        status: 404,
        msg: "product not found",
      });
    return product;
  } catch (err) {
    if (err.message.slice(0, 21) === "Cast to Number failed")
      return Promise.reject({
        status: 400,
        msg: "invalid product id",
      });
  }
};

exports.saveAProduct = async (title, price, description, category) => {
  try {
    const lastId = await ProductsSchema.find({}, "id")
      .sort({ id: -1 })
      .limit(1);
    const nextId = lastId[0].id + 1;

    const newProduct = new ProductsSchema({
      id: nextId,
      title,
      price,
      description,
      category,
      image: `/img/${nextId}.jpg`,
      rating: {
        rate: 0,
        count: 0,
      },
    });

    const saved = await newProduct.save();
   
    return saved;
  } catch (err) {
    if (
      err.message.slice(0,26) ===
      "Products validation failed"
    )
      return Promise.reject({
        status: 400,
        msg: "invalid price",
      });
  }
};

exports.saveCategory = async (name) => {
  try {
    const newCategory = new CategorySchema({
      name,
    });

    const saved = await newCategory.save();
    return saved;
  } catch (err) {
    return Promise.reject({
      status: 400,
      msg: "category already exists",
    });
  }
};

exports.findSaveRating = async (id, rating) => {
  try {
    const product = await ProductsSchema.findOne({ id });

    if (!product) {
      return Promise.reject({
        status: 404,
        msg: "product doesn't exist",
      });
    }

    const oldCount = product.rating.count;
    const newCount = oldCount + 1;
    const oldRating = product.rating.rate;
    const newRating = (oldCount * oldRating + rating) / newCount;

    product.rating.rate = newRating.toFixed(5);
    product.rating.count = newCount;

    const newProduct = await product.save();
    return newProduct;
  } catch (err) {
    if (err.message.slice(0, 31) === "Cast to Number failed for value")
      return Promise.reject({
        status: 400,
        msg: "invalid product id",
      });
    else if (
      err.message.slice(0, 39) === "Products validation failed: rating.rate"
    ) {
      return Promise.reject({
        status: 400,
        msg: "invalid rating",
      });
    }

    return err;
  }
};
