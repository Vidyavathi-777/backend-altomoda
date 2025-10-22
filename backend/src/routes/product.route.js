const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

// Categories and brands (specific routes first!)
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);

// Product listing and details
router.get('/', productController.getAllProducts);
router.get("/:id",productController.getProductById)
router.get('/:sku', productController.getProduct);
router.get('/:sku/availability', optionalAuth, productController.getProductAvailability);

router.get('/categories/tree',productController.getCategoryTree)
router.post('/filter',productController.getProductsWithFilters)
router.get('/categoryChildren/:categoryId',productController.getChildCategories)

module.exports = router;
