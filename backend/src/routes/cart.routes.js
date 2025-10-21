const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

router.post('/', optionalAuth, cartController.createOrUpdateCart);
router.get('/:cartId', cartController.getCart);

module.exports = router;

