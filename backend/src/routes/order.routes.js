// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require("../../controllers/order.controller");
const { protect } = require('../../middlewares/auth.middleware');

router.post('/', protect, orderController.createOrder);
router.get('/user/:userId', protect, orderController.getOrdersByUserId)
router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
