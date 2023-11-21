const mongoose = require('mongoose');


const typesSchema = new mongoose.Schema({

    type_id: {
        type: Number,
    },
    gender: {
        type: Number,
    },
    types: [
        {
            label:{
                type:String,
                required: true,
            },
            
            value:{
                type:Number,
                required: true,
            },
        }
    ]

})



module.exports = mongoose.model("Types", typesSchema)