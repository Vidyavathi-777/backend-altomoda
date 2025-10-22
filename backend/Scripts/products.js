const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Category = require('../models/Category');
const logger = require('../utils/logger');
const config = require('../config/env');

// --- Connect to MongoDB ---
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('❌ MongoDB connection error', err));

// --- API Config ---
const CLOUDSTORE_URL = 'https://sandbox.csplatform.io:9950/shop/v1/categories/tree';
const HEADERS = {
  Authorization: `Bearer ${config.cloudstore.apiKey}`, // Add your token in .env
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// --- Helper Functions ---
async function fetchCategories() {
  try {
    const response = await axios.get(CLOUDSTORE_URL, { headers: HEADERS });
    return response.data;
  } catch (error) {
    logger.error('❌ Error fetching categories:', error.message);
    throw error;
  }
}

async function saveCategory(categoryData, parentId = null) {
  const transformed = {
    name: {
      locs: {
        en: categoryData.name,
        it: categoryData.name,
      },
    },
    level: categoryData.level,
    leaf: !categoryData.children || categoryData.children.length === 0,
    parent_id: parentId,
    custom_categories: new Map([
      ['cloudstore_original_id', categoryData.id?.$oid || categoryData.id],
    ]),
  };

  const newCategory = new Category(transformed);
  await newCategory.save();

  logger.info(`📁 Created category: ${categoryData.name} (Level ${categoryData.level})`);
  return newCategory;
}

async function processCategories(categories, parentId = null) {
  for (const cat of categories) {
    const createdCat = await saveCategory(cat, parentId);

    if (cat.children && cat.children.length > 0) {
      const childDocs = await processCategories(cat.children, createdCat._id);
      createdCat.children = childDocs.map((c) => c._id);
      await createdCat.save();
    }
  }
  return await Category.find({ parent_id: parentId });
}

// --- Migration Runner ---
async function migrateCategories() {
  try {
    logger.info('🚀 Starting category migration from Cloudstore...');

    const categories = await fetchCategories();
    await Category.deleteMany({});
    logger.info('🧹 Cleared old categories');

    await processCategories(categories);

    logger.info('✅ Category migration completed successfully!');
    const total = await Category.countDocuments();
    logger.info(`📊 Total categories inserted: ${total}`);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// --- Run if called directly ---
if (require.main === module) {
  migrateCategories();
}

module.exports = migrateCategories;
