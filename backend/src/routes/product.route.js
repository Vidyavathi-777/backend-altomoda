const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

// Product listing and details
router.get('/', productController.getProducts);
router.get('/:sku', productController.getProduct);
router.get('/:sku/availability', optionalAuth, productController.getProductAvailability);

// Categories and brands
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);

module.exports = router;
