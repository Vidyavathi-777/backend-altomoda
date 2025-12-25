const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      locs: {
        en: { type: String, required: true },
        it: { type: String },
      },
    },
    leaf: {
      type: Boolean,
      default: false,
      index: true,
    },
    level: {
      type: Number,
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    custom_categories: {
      type: Map,
      of: String,
    },
    standard_categories: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

categorySchema.index({ parent_id: 1 });

module.exports = mongoose.model("Category", categorySchema);
