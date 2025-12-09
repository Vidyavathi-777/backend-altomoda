const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    cloudId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    stock_price: { type: Number, required: true },
    qty: { type: Number, default: 0 },

    cats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    whs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }],

    locs: {
      singles: {
        fit: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        }, 
        size_conversion: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        color: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        made: { ru: String, en: String, it: String, zh: String },
        sex: { en: String, it: String },
        belt_loops: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        fastening: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        title: { ru: String, en: String, it: String, zh: String },
        care: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        desc: { ru: String, en: String, it: String, zh: String },
      },
      lists: {
        pockets: [
          {
            ru: String,
            en: String,
            it: String,
            es: String,
            nl: String,
            zh: String,
          },
        ],
        materials: [
          {
            ru: String,
            en: String,
            it: String,
            es: String,
            nl: String,
            zh: String,
          },
        ],
        colors: [
          {
            ru: String,
            en: String,
            it: String,
            es: String,
            nl: String,
            zh: String,
          },
        ],
      },
    },

    imgs: [
      {
        url: { type: String, required: true },
        pos: Number,
        placement: [String],
        excluded_shops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shop" }],
      },
    ],

    composition: [
      {
        material: {
          ru: String,
          en: String,
          it: String,
          es: String,
          nl: String,
          zh: String,
        },
        perc: Number,
      },
    ],

    props: {
      mnf_code: String,
      model_size_waistline: String,
      season_short: String,
      ns_internal_id: String,
      model_size_chest: String,
      hs_code: String,
      ns_external_id: String,
      sku_parent: String,
      size_grid: String,
      size: String,
      model_size_hip: String,
      season: String,
      buy_price: Number,
      mnf_color_code: String,
      model_size_height: String,
      barcode: String,
      brand: String,
      age: String,
      mnf_material_code: String,
      size_of_picture: String,
      po: String,
    },
    tryonImageUrl: { type: String, default: null }, 

    lst_info_update_dt: Date,
    pb: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
