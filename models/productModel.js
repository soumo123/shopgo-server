const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [8, "price cannot exceed 8 characters"]
    },
    discount: {
        type: Number

    },
    dealer_id:{
        type:String
    },
    type:{
        type:String,
        default:3
    },
    visible_for:{
        type:Number
    },
    actualpricebydiscount:{
        type: Number,
        default:0
    },
    color:{
        type:String,

    },
    size :{
        type:String,

    },
    ratings: {
        type: Number,
        default: 0
    },
    likes:{
        type:Number
    },
    images: [
        {
            public_id:
            {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    categories: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        // maxLength:[30,"stock cannot exceed 5 characters"],
        // default:1
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true

            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }

        }
    ],

    size:{
        type:Array
    },
    // user: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "User",
    //     required: true
    // },
    productsearch:{
        type:String
    },
    productId:{
        type:String,
    },
    deliveryDays:{
        type:String,
        default:0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})



module.exports = mongoose.model('Product', productSchema)