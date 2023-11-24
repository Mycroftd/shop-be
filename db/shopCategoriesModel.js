const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please provide a category"],
        unique: [true, "category exists"],
    },
})

module.exports = mongoose.model.Categories || mongoose.model("Categories", CategorySchema);