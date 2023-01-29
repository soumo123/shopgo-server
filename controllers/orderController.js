const Order = require("../models/orderModel")
const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const { findById } = require("../models/orderModel")
const { sendMessages } = require("./messagesController")


//create new order//

exports.newOrder = catchAsyncError(async (req, res, next) => {

    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, totalPrice, shippingPrice, dealers } = req.body

    let d = new Date();
    let delivered = d.setDate(d.getDate() + 5);
    const deliveredAt = new Date(delivered).toISOString().substring(0, 10);


    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        totalPrice,
        shippingPrice,
        paidAt: Date.now(),
        user: req.user._id,
        dealers: dealers,
        deliveredAt
    })



    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
    })

})

//get single order////////////////////////////////
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate("user", "name  email")

    if (!order) {
        return next(new ErrorHandler('order not found in this Id', 401))
    }

    res.status(200).json({
        success: true,
        order
    })

});


//get logged in user orders//

exports.myOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        message: "My aorders are....",
        orders
    })

});



//get all orders --Admin////

exports.getAllOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.find()

    let totalAmount = 0
    orders.forEach(order => {
        totalAmount = totalAmount + order.totalPrice
    })

    res.status(200).json({
        success: true,
        message: "Orders Viewd my Admin..",
        totalAmount,
        orders
    })

});


//update order status/////


exports.updateOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('order not found in this Id', 404))
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler('You have already delivered this order', 400))
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }

    order.orderStatus = req.body.status

    if (req.body.status === "Delivered") {
        // order.deliveredAt = Date.now()
        order.paymentInfo.status = "succeeded"
    }

    await order.save({ validateBefore: true })

    res.status(200).json({
        success: true,

    })

});

async function updateStock(id, quantity) {

    try {
        const product = await Product.findById(id)
        product.stock -= quantity

        await product.save({ validateBefore: true })
    } catch (error) {
        console.log("Update stock error", error)

    }


}


//delete order //////////
exports.deleteOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('order not found in this Id', 404))
    }
    await order.remove()

    res.status(200).json({
        success: true,
        message: "Order Delted Succesfully....",
    })

});





//category-admin ----------------->


exports.categoryAdmingetAllOrders = catchAsyncError(async (req, res, next) => {

    // const user = req.body.user_id
    // const orders = await Order.find({user:user})

    // let totalAmount = 0
    // orders.forEach(order=>{
    //     totalAmount = totalAmount + order.totalPrice
    // })

    // res.status(200).json({
    //     success: true,
    //     message:"Orders Viewd my Cat-Admin..",
    //     totalAmount,
    //     orders
    // })
    let data = []
    let totalAmount = 0
    const user = req.body.user_id
    const allorders = await Order.find()

    for (let i = 0; i < allorders.length; i++) {

        const orderItems = allorders[i].orderItems

        orderItems.forEach((ele) => {
            if (ele.user === user) {
                data.push(ele)
                totalAmount = totalAmount + ele.price
            }

        })

    }

    res.status(200).json({
        success: true,
        message: "Orders Viewd my Cat-Admin",
        totalAmount,
        orders:data
    })

});






///get single order by cat -admin////////////////////////////////
exports.categoryAdminSingleOrder = catchAsyncError(async (req, res, next) => {
    let data = []
    const productId = req.query.productId
console.log("productId",productId)
    const allorders = await Order.find()

    for (let i = 0; i < allorders.length; i++) {

        const orderItems = allorders[i].orderItems

        orderItems.forEach((ele) => {
            if (ele.id === productId) {
                data.push(ele)
            }

        })

    }
    res.status(200).json({
        success: true,
        message: "Single Order Viewd my Cat-Admin",
        orders:data
    })


});
