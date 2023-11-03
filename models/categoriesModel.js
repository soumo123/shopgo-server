const mongoose = require('mongoose');


const categoriesSchema = new mongoose.Schema({

    cat_name: {
        type: String,
        required:true
    },
    type: {
        type: Number,
        required: true
    },
    link: {
        type: String,
        required:true
    }

})



module.exports = mongoose.model("Categories", categoriesSchema)