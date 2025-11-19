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
})
mongoose.connection.on('connected', () =>
  logger.info('⚡ MongoDB connected with optimized pool')
);
mongoose.connection.on('error', (err) =>
  logger.error('❌ MongoDB connection error', err)
);

class ProductImporter {
  constructor() {
    this.categoryMap = new Map();
    this.CONCURRENCY = 5; // 5 pages in parallel
  }

  // --------------------------------
  // Load category mappings into memory
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
  // Retry logic wrapper
  // --------------------------------
  async fetchWithRetry(page, pageSize, retries = 3) {
    try {
      return await cloudstoreService.getFullCatalog(page, pageSize);
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
  // Process a single page
  // --------------------------------
  async processPage(page, pageSize) {
    const data = await this.fetchWithRetry(page, pageSize);
    const items = data.content || [];

    const bulkOps = [];

    for (const p of items) {
      const mappedCats = this.mapCategoryIds((p.cats || []).map(c => c.$oid));

      bulkOps.push({
        updateOne: {
          filter: { sku: p.sku },
          update: {
            $set: {
              cloudId: p.item_id?.$oid,
              sku: p.sku,
              stock_price: p.stock_price,
              qty: p.qty || 0,
              cats: mappedCats,
              whs: p.whs?.map(w => w.$oid) || [],
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
            }
          },
          upsert: true,
        }
      });
    }

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps, { ordered: false });
    }

    logger.info(`📦 Page ${page} imported | ${items.length} items`);
  }

  // --------------------------------
  // Main Import Workflow
  // -------------------------------- updatemany
  async importProducts() {
    await this.initializeCategoryMappings();

    const first = await cloudstoreService.getFullCatalog(1, 100);
    const totalPages = first._metadata?.total_pages || 1;
    logger.info(`🚀 Total pages: ${totalPages}`);

    let page = 1196;


    while (page <= totalPages) {
      const batch = [];

      for (let i = 0; i < this.CONCURRENCY && page <= totalPages; i++) {
        batch.push(this.processPage(page, 100));
        page++;
      }

      await Promise.all(batch);
    }

    logger.info('🎉 All products imported successfully (optimized)');
    process.exit(0);
  }
}

// --------------------------------
// Run the importer
// --------------------------------
(async () => {
  const importer = new ProductImporter();
  await importer.importProducts();
})();
