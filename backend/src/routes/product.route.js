const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');
const searchController = require("../../controllers/search.controller")
const tryOn = require('../../controllers/tryon.controller')
const multer = require('multer')


router.get('/search', searchController.searchProducts)
const upload = multer({ storage: multer.memoryStorage() });


router.post(
    "/tryon",
    upload.fields([
        { name: "userImage", maxCount: 1 },
        { name: "outfitImage", maxCount: 1 }
    ]),
    tryOn.generateTryOn
);

router.get("/proxy-image", tryOn.proxyImage);

// Categories and brands (specific routes first!)
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get("/new-arrivals/:categoryId", productController.getNewProducts)
router.get("/related/:sku", productController.getRelatedProducts)
// Product listing and details
router.get('/', productController.getAllProducts);
router.get("/:id",productController.getProductById)
// router.get('/:sku', productController.getProduct);
router.get('/:sku/availability', optionalAuth, productController.getProductAvailability);

router.get('/categories/tree',productController.getCategoryTree)
router.post('/filter',productController.getProductsWithFilters)
router.get('/categoryChildren/:categoryId',productController.getChildCategories)
router.get("/categroyLevels/:id",productController.getCategoryLevelsById)
router.get("/productbyCategroy/:id",productController.getProductsByCategory)
router.get("/productsbyBrand/:categoryId/:brand", productController.getProductsByBrand)
router.get("/productBySku/:sku",productController.getProductBySkuParent)


module.exports = router;