const express = require('express')
const router = express.Router()
const { isAuthenticatedUser } = require('../middleware/auth')

const {cancelOrder}  = require('../controllers/cancelOrderController')


router.route('/cancel/:token/:id').post(isAuthenticatedUser,cancelOrder)
module.exports = router