// routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../../controllers/webhook.controller');

// Public - PhonePe will call this, so no JWT
router.post('/phonepe', webhookController.phonepeWebhook);

module.exports = router;
