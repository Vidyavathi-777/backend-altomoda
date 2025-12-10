const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudstoreService = require('../services/cloudstore.service');
const logger = require('../utils/logger');
const config = require('../config/env');

// --------------------------------
// MongoDB Connection
// --------------------------------
mongoose.connect(config.mongoUri, {
  maxPoolSize: 25,
  socketTimeoutMS: 45000,
});
mongoose.connection.on('connected', () =>
  logger.info('⚡ MongoDB connected with optimized pool')
);
mongoose.connection.on('error', (err) =>
  logger.error('❌ MongoDB connection error', err)
);

class ProductImporter {
  constructor() {
    this.categoryMap = new Map();
    this.CONCURRENCY = 5; // pages processed in parallel
  }

  // --------------------------------
  // Load category mappings INTO MEMORY
  // --------------------------------
  async initializeCategoryMappings() {
    logger.info('🔄 Loading category mappings...');

    const categories = await Category.find(
      { 'custom_categories.cloudstore_original_id': { $exists: true } },
      { 'custom_categories.cloudstore_original_id': 1 }
    ).lean();

    for (const cat of categories) {
      const cloudstoreId = cat.custom_categories.cloudstore_original_id;
      if (cloudstoreId) {
        this.categoryMap.set(cloudstoreId, cat._id);
      }
    }

    logger.info(`📌 Loaded ${this.categoryMap.size} category mappings`);
  }

  mapCategoryIds(cloudstoreCategoryIds = []) {
    return cloudstoreCategoryIds
      .map(id => this.categoryMap.get(id))
      .filter(Boolean);
  }

  // --------------------------------
  // Retry wrapper for API
  // --------------------------------
  async fetchWithRetry(page, pageSize, retries = 3) {
    try {
      return await cloudstoreService.getCatalogWithQuantities(page, pageSize);
    } catch (err) {
      if (retries > 0) {
        logger.warn(`⏳ Retry page ${page} (${3 - retries + 1}/3)`);
        await new Promise(res => setTimeout(res, 1500));
        return this.fetchWithRetry(page, pageSize, retries - 1);
      }
      throw err;
    }
  }

  // --------------------------------
  // PROCESS SINGLE PAGE
  // (CORRECTED — Uses actual page index)
  // --------------------------------
  async processPage(page) {
    const data = await this.fetchWithRetry(page, 100);
    const items = data.content || [];

    const bulkOps = [];

    for (const p of items) {
      const cloudId = p.item_id?.$oid;
      const sku = p.sku;

      const mappedCats = this.mapCategoryIds((p.cats || []).map(c => c.$oid));

      bulkOps.push({
        updateOne: {
          filter: { sku },
          upsert: true,
          update: {
            $set: {
              cloudId,
              sku,
              stock_price: p.stock_price,
              sale_price: p.sale_price,
              qty: p.qty || 0,

              // Only Store Warehouse IDs (schema expects ObjectIds)
              whs: p.whs?.map(w => w.wh_id?.$oid) || [],

              locs: p.locs || {},

              imgs: (p.imgs || []).map(img => ({
                url: img.url,
                pos: img.pos,
                placement: img.placement || [],
                excluded_shops: (img.excluded_shops || []).map(s => s.$oid),
              })),

              composition: p.composition || [],
              props: p.props || {},

              lst_info_update_dt: p.lst_info_update_dt?.$date
                ? new Date(p.lst_info_update_dt.$date)
                : new Date(),

              pb: p.pb || {},
            },

            // NEW products only
            $setOnInsert: {
              cats: mappedCats
            }
          }
        }
      });

    }

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps, { ordered: false });
    }

    logger.info(`📦 Imported page ${page} | ${items.length} products`);
  }

  // --------------------------------
  // MAIN WORKFLOW
  // --------------------------------
  async importProducts() {
    await this.initializeCategoryMappings();

    const firstPage = await cloudstoreService.getCatalogWithQuantities(0, 100);
    const totalPages = firstPage._metadata?.total_pages || 0;

    logger.info(`🚀 Total pages available: ${totalPages}`);

    let page = 0;

    while (page <= totalPages) {
      const batch = [];

      for (let i = 0; i < this.CONCURRENCY && page <= totalPages; i++) {
        batch.push(this.processPage(page));
        page++;
      }

      await Promise.all(batch);
    }

    logger.info(`🎉 Successfully imported ${totalPages + 1} pages`);
    process.exit(0);
  }
}

// --------------------------------
// RUN IMPORTER
// --------------------------------
(async () => {
  const importer = new ProductImporter();
  await importer.importProducts();
})();


// const mongoose = require("mongoose");
// const Product = require("../models/Product.js");

// async function run() {
//   await mongoose.connect("mongodb://Alaiy:alaiy2024xyz@35.154.41.149:27017/Altomoda?authSource=admin");

//   const result = await Product.updateMany(
//     { tryonImageUrl: { $regex: "^https?://" } },
//     { $unset: { tryonImageUrl: "" } }
//   );

//   console.log("Deleted URLs Count:", result.modifiedCount);
//   process.exit(0);
// }

// run();
