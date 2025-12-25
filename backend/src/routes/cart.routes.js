const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { optionalAuth, protect } = require('../../middlewares/auth.middleware');

// router.post('/', optionalAuth, cartController.createOrUpdateCart);
// router.get('/:cartId', cartController.getCart);
// router.get('/user/:userId', optionalAuth, cartController.getUserCart);

router.post('/items', cartController.addToCart)
router.get('/:userId', cartController.getCart)
router.put('/items/:sku', cartController.updateCartItem)
router.delete('/items/:sku', cartController.removeCartItem)
router.delete('/:userId', cartController.clearCart)

module.exports = router;