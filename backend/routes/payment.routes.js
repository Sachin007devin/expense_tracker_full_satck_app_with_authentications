const express = require('express')
const router = express.Router()

const authentication = require('../middleware/authenticate')
const paymentController = require('../controller/payment.controller')

router.post('/create-order',authentication.authenticate,paymentController.createOrder)

router.get('/payment-status/:orderId', paymentController.verifyPayment);

// Webhook (Cashfree will call this, no auth middleware)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router