const express = require('express');
const Product = require('../../models/Product');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { optionalAuth, protect } = require('../../middlewares/auth.middleware');
const attachTryOnSession = require("../../middlewares/tryon.middleware")
const searchController = require("../../controllers/search.controller")
const multer = require('multer')
const tryon = require('../../controllers/tryon.controller')


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1 // Single file
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});




router.get('/search', searchController.searchProducts)
// const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/tryon",
  upload.single("userImage"),
  tryon.generateTryOn
);

router.post("/tryon/queue", protect, attachTryOnSession, tryon.createTryOnQueue);

router.get(
  "/tryon/queue/:queueId",
  protect,
  attachTryOnSession,
  tryon.getQueueStatus
);

// router.post("/tryon/queue/append", protect, tryon.appendToQueue)
router.post("/tryon/save-image", protect, upload.single("userImage"), tryon.saveUserImage);
router.delete("/tryon/delete-image", protect, tryon.deleteUserImage);
router.get("/tryon/check-image", protect, tryon.checkUserImage);

router.get('/notbrand', productController.getBrandsWithoutProducts)

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