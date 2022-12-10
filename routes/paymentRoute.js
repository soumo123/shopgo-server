const express = require('express')
const { processPayment,sendStripeApiKey } = require('../controllers/paymentController')
const router = express.Router()


const {isAuthenticatedUser} = require("../middleware/auth")

router.route("/payment/process/:token").post(isAuthenticatedUser,processPayment)

router.route("/stripeApiKey/:token").get(isAuthenticatedUser,sendStripeApiKey)

module.exports = router