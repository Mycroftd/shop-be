const mongoose = require("mongoose");

const ratingSub = new mongoose.Schema({
  rate: { type: Number, min: 0, max: 5 },
  count: Number,
});

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, "Please enter a unique number"],
    unique: [true, "id exists"],
  },
  title: String,
  price: {type:Number,min:0.01},
  description: String,
  category: String,
  image: String,
  rating: ratingSub,
});

module.exports =
  mongoose.model.Products || mongoose.model("Products", ProductSchema);
