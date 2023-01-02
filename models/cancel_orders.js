const mongoose = require('mongoose');

const cancelOrderSchema = new mongoose.Schema({
 
    reason:{
        type: String,
        required: true
    },

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("cancel_orders", cancelOrderSchema)