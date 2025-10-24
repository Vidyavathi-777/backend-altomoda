const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const Category = require('../models/Category'); // Import Category model
const cloudstoreService = require('../services/cloudstore.service');
const logger = require('../utils/logger');
const config = require('../config/env');

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', err));

class ProductImporter {
  constructor() {
    this.categoryMap = new Map(); // Cloudstore ID -> Local ObjectId
  }

  async initializeCategoryMappings() {
    logger.info('🔄 Loading category mappings...');
    
    // Load all categories and create mapping
    const categories = await Category.find({
      'custom_categories.cloudstore_original_id': { $exists: true }
    });
    
    for (const category of categories) {
      const cloudstoreId = category.custom_categories.get('cloudstore_original_id');
      if (cloudstoreId) {
        this.categoryMap.set(cloudstoreId, category._id);
      }
    }
    
    logger.info(`✅ Loaded ${this.categoryMap.size} category mappings`);
  }

  // Map Cloudstore category IDs to local MongoDB ObjectIds
  mapCategoryIds(cloudstoreCategoryIds = []) {
    const localCategoryIds = [];
    
    for (const cloudstoreId of cloudstoreCategoryIds) {
      const localId = this.categoryMap.get(cloudstoreId);
      if (localId) {
        localCategoryIds.push(localId);
      } else {
        logger.warn(`⚠️ No local category found for Cloudstore ID: ${cloudstoreId}`);
      }
    }
    
    return localCategoryIds;
  }

  async importProducts() {
    try {
      await this.initializeCategoryMappings();
      
      let page = 235;
      const pageSize = 100;
      let totalPages = 0;

      logger.info('Fetching products from CloudStore...');

      do {
        const data = await cloudstoreService.getFullCatalog(page, pageSize);
        const productsArray = data.content;

        if (!Array.isArray(productsArray)) {
          throw new Error('Invalid product data from CloudStore');
        }

        const products = productsArray.map(p => {
          // Extract Cloudstore category IDs
          const cloudstoreCategoryIds = p.cats?.map(c => c.$oid) || [];
          
          // Map to local MongoDB ObjectIds
          const localCategoryIds = this.mapCategoryIds(cloudstoreCategoryIds);
          
          return {
            cloudId: p.item_id?.$oid,
            sku: p.sku,
            stock_price: p.stock_price,
            qty: p.qty || 0,
            cats: localCategoryIds, // Now storing ObjectIds instead of strings
            whs: p.whs?.map(w => w.$oid) || [],
            locs: p.locs || {},
            imgs: (p.imgs || []).map(img => ({
              url: img.url,
              pos: img.pos,
              placement: img.placement || [],
              excluded_shops: (img.excluded_shops || []).map(shop => shop.$oid)
            })),
            composition: p.composition || [],
            props: p.props || {},
            lst_info_update_dt: p.lst_info_update_dt?.$date
              ? new Date(p.lst_info_update_dt.$date)
              : new Date(),
            pb: p.pb || {},
          };
        });

        // Upsert products
        for (const prod of products) {
          await Product.updateOne(
            { sku: prod.sku }, 
            prod, 
            { upsert: true }
          );
        }

        logger.info(`✅ Imported page ${page} with ${products.length} products (${products[0]?.cats?.length || 0} categories mapped)`);
        
        totalPages = data._metadata?.total_pages;
        page++;
        
      } while (page <= totalPages);

      logger.info('🎉 All products imported successfully with category mapping!');
      process.exit(0);
    } catch (error) {
      logger.error('Error importing products:', error);
      process.exit(1);
    }
  }
}

// Run the importer
async function runImport() {
  const importer = new ProductImporter();
  await importer.importProducts();
}

runImport();


// const mongoose = require('mongoose');
// require('dotenv').config();
// const Product = require('../models/Product'); // Adjust the path if needed
// const logger = require('../utils/logger');
// const config = require('../config/env');

// mongoose.connect(config.mongoUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
// mongoose.connection.on('error', (err) => logger.error('❌ MongoDB connection error', err));

// async function deleteAllProducts() {
//   try {
//     const result = await Product.deleteMany({});
//     logger.info(`🗑️  All products deleted. Count: ${result.deletedCount}`);
//   } catch (error) {
//     logger.error('❌ Error deleting products:', error);
//   } finally {
//     mongoose.disconnect();
//   }
// }

// // Run if called directly
// if (require.main === module) {
//   deleteAllProducts();
// }

// module.exports = deleteAllProducts;

