const express = require('express')
const router = express.Router()

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')

const {newOrder,getSingleOrder,myOrders,getAllOrders,updateOrder,deleteOrder} = require('../controllers/orderController')

router.route('/order/new/:token').post(isAuthenticatedUser,newOrder)


router.route('/order/:id/:token').get(isAuthenticatedUser,getSingleOrder)

router.route('/orders/me/:token').get(isAuthenticatedUser,myOrders)


router.route('/admin/orders/:token').get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders)

router.route('/admin/order/:id/:token').put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder)


router.route('/admin/order/:id/:token').delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)

module.exports = router

