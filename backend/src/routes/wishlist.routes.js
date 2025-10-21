const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.get('/', protect, wishlistController.getWishlist);
router.post('/', protect, wishlistController.addToWishlist);
router.delete('/:sku', protect, wishlistController.removeFromWishlist);

module.exports = router;