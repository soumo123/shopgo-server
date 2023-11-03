const mongoose = require('mongoose');


const sizeSchema = new mongoose.Schema({

    size_type: {
        type: String,
    },
    id: {
        type: Number,
    }

})



module.exports = mongoose.model("Size", sizeSchema)