const CancelOrder = require("../models/cancel_orders")
const Order = require("../models/orderModel")
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')
const nodemailer = require('nodemailer');
const path = require('path')


exports.cancelOrder = catchAsyncError(async (req, res) => {

    const { reason } = req.body
    const order = await Order.findById(req.params.id)

    const cancelOrder = await CancelOrder.create({
        reason,
        user: req.user._id
    })
    await order.remove()


    res.status(201).json({
        success: true,
        message: 'Order Cancelled successfully',
        cancelOrder
    })
    
})
