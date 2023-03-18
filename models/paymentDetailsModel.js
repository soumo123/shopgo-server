const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
 
    orderId:{
        type:String
    },
    paymentStatus:{
        type: String,
        default:"Processing"
    },
    orderItems:[
        {

            name:{
                type: String,
                required: true
            },
            price:{
                type: Number,
                required: true
            },
            quantity:{
                type: Number,
                required: true
            },
            image:{
                type: String,
                required: true
            },
            product:{
                type: mongoose.Schema.ObjectId,
                ref:"Product",
                required: true
            },
            done:{
                type:String,
                default:"0"
            },
            user:{
                type:String,
                required: true
            },
            status:{
                type: String,
                required: true,
                default: "Processing"
            },
            deliveryTime:{
                type:String
            }
        }
    ],
    deliveryDate:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("payment_details", paymentSchema)