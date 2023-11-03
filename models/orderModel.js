const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    //     shippingInfo: {
    //         address:{
    //             type: String,
    //             required: true,

    //         },

    //         city: {
    //             type: String,
    //             required: true
    //         },
    //         state: {
    //             type: String,
    //             required: true
    //         },

    //         country: {
    //             type: String,
    //             required: true
    //         },
    //         pinCode: {
    //             type: Number,
    //             required: true
    //         },
    //         phoneNo: {
    //             type: Number,
    //             required: true
    //         },
    //     },

    //     orderItems:[
    //         {

    //             name:{
    //                 type: String,
    //                 required: true
    //             },
    //             price:{
    //                 type: Number,
    //                 required: true
    //             },
    //             quantity:{
    //                 type: Number,
    //                 required: true
    //             },
    //             image:{
    //                 type: String,
    //                 required: true
    //             },
    //             product:{
    //                 type: mongoose.Schema.ObjectId,
    //                 ref:"Product",
    //                 required: true
    //             },
    //             done:{
    //                 type:String,
    //                 default:"0"
    //             },
    //             user:{
    //                 type:String,
    //                 required: true
    //             },
    //             status:{
    //                 type: String,
    //                 required: true,
    //                 default: "Processing"
    //             },
    //             customer_name:{
    //                 type:String,
    //                 required: true
    //             },
    //             deliveryTime:{
    //                 type:String
    //             }
    //         }
    //     ],
    //     resource_id:{
    //         type:Number
    //     },

    //     user:{
    //         type:mongoose.Schema.ObjectId,
    //         ref:"User",
    //         required:true
    //     },

    //     dealers:[

    //     ],
    //     paymentInfo:{
    //         id:{
    //             type: String,
    //             required: true
    //         },
    //         status:{
    //             type: String,
    //             required: true
    //         }
    //     },

    //     paidAt:{
    //         type: Date,
    //         required: true
    //     },
    //     itemsPrice:{
    //         type: Number,
    //         default: 0,
    //         required: true
    //     },
    //     taxPrice:{
    //         type: Number,
    //         default: 0,
    //         required: true
    //     },
    //     totalPrice:{
    //         type: Number,
    //         default: 0,
    //         required: true
    //     },
    //     shippingPrice:{
    //         type: Number,
    //         default: 0,
    //         required: true
    //     },
    //     orderStatus:{
    //         type: String,
    //         required: true,
    //         default: "Processing"
    //     },
    //     deliveredAt:Date,
    //     createdAt:{
    //         type: Date,
    //         default: Date.now
    //     }


    order_id:{
        type:String,
        required:true
    },
    order_date:{
        type: Date,
        default: Date.now
    },
    pickup_location:{
        type:String,
    },
    customer_details:{
        user_id: {
            type: String,
            required: true,
        },
        billing_customer_name:{
            type:String,
            required:true
        },
        billing_last_name:{
            type:String
        },
        billing_address:{
            type:String
        },
        billing_address_2:{
            type:String
        },
        billing_city:{
            type:String
        },
        billing_pincode:{
            type:String
        },
        billing_state:{
            type:String
        },
        billing_country:{
            type:String
        },
        billing_email:{
            type:String
        },
        billing_phone:{
            type:String
        }
    },

    dealer_id: {
        type: String,
        required: true,
    },
  
    resource_id: {
        type: String,
        required: true,
    },
    status: {
        type: Number
    },
    product_id:{
        type:String
    },
    prduct_name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    deliveryTime:{
        type:Number
    },
    price:{
        type:Number,
        required: true
    },
    units:{
        type:Number,
        default:1
    },
    discount:{
        type:Number
    },
    tax:{
        type:Number
    },
    payment_method:{
        type:String
    },
    payment_sttaus:{
        type:Number
    },
    deleted_at:{
        type:String,
        default:0
    },



})

module.exports = mongoose.model("Order", orderSchema)