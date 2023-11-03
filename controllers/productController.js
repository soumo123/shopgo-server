const Product = require('../models/productModel')
const Categories = require('../models/categoriesModel')
const Dealer = require('../models/dealer.model.js')
const Sizes = require('../models/size.model.js')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')
const cloudinary = require("cloudinary");
const getNextSequentialId = require('../utils/generateId.js')


//create product by admin//
exports.createProduct = catchAsyncError(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images); update
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });
        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });

    }

    req.body.images = imagesLinks;
    // req.body.user = req.user.id
    const lastId = await getNextSequentialId("PD")
    console.log("lastId", lastId)
    req.body.productId = lastId
    req.body.productsearch = req.body.name + req.body.description
    const discount = req.body.discount

    if (discount) {
        const discountData = req.body.price * discount / 100
        req.body.actualpricebydiscount = req.body.price - discountData
    }
    req.body.likes = 0
    const product = await Product.create(req.body)
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
    })

})


//get all products//

exports.getAllproducts = catchAsyncError(async (req, res, next) => {

    //for pagiation//

    const resultPerPage = 8
    const productscount = await Product.countDocuments()

    const apifeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()

    let products = await apifeatures.query
    let filterProductsCount = products.length

    apifeatures.pagination(resultPerPage)
    products = await apifeatures.query

    res.status(200).json(
        {
            success: true,
            products,
            productscount,
            resultPerPage,
            filterProductsCount
        })

})


//get all products by admin

exports.getAdminproducts = catchAsyncError(async (req, res, next) => {

    const productName = req.query.name;
    let products;

    if (productName) {
        products = await Product.find({ name: { $regex: '.*' + productName + '.*', $options: 'i' } })
    } else {
        products = await Product.find()

    }



    res.status(200).json(
        {
            success: true,
            products,
        })

})





//get product by id////

exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
    res.status(200).json({
        success: true,
        product,

    })

})

//update products//

exports.updateProduct = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }

    const discount = req.body.discount

    if (discount) {
        const discountData = req.body.price * discount / 100
        req.body.actualpricebydiscount = req.body.price - discountData
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product
    })
})

//delete product////

exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove()
    res.status(200).json({
        success: true,
        message: "Product delete succesfully"
    })
})

//Add product review and update review////////////////

exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)
    const isReviewed = await product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())



    if (isReviewed) {

        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating),
                    (rev.comment = comment)
        })
    } else {

        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg = avg + rev.rating
    })


    product.ratings = avg / product.reviews.length


    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})

//get all reviews of a product///

exports.getProductReviews = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })

})

//delte review of a product///
exports.deleteProductReviews = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);


    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    )
    console.log(reviews)
    let avg = 0;
    reviews.forEach((rev) => {
        avg = avg + rev.rating
    })

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }
    // const ratings = avg / reviews.length

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews
        }, {

        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: 'Reviews deleted successfully'
    })
})



exports.getDiscountProduct = catchAsyncError(async (req, res, next) => {

    try {

        const products = await Product.find()

        const dealproducts = products.filter((ele) => {
            if (ele.discount > 0) {
                return true
            }
        })

        return res.status(200).json({
            success: true,
            dealproducts
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        })
    }

})












exports.likeProductUpdate = catchAsyncError(async (req, res, next) => {

    try {
        const newLike = req.query.likes
        const nowLike = Number(newLike)

        const products = await Product.findById(req.params.id)

        products.likes = products.likes + nowLike

        await products.save()

        return res.status(200).json({
            success: true,
            products
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        })
    }

})







//get like products

exports.getLikeProducts = catchAsyncError(async (req, res, next) => {

    try {

        const products = await Product.find()

        const likebleProducts = products.filter((ele) => {
            if (ele.likes > 0) {
                return true
            }
        })

        return res.status(200).json({
            success: true,
            likebleProducts
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        })
    }

})




//categorical admin------------------------------------>>>>>>>

exports.getAllProductsByCategoryAdmin = catchAsyncError(async (req, res, next) => {


    try {
        const user = req.params.user_id
        const productName = req.query.name;
        let products;

        if (productName) {
            products = await Product.find({ name: { $regex: '.*' + productName + '.*', $options: 'i' }, user: user })
        } else {
            products = await Product.find({ user: user })
        }


        return res.status(200).send({ success: true, message: "Gell all Products", products: products })



        // products = await Product.find({user:user})

        // if(!products){
        //     return res.status(400).send({success:true,message:"No products there",products:[]})
        // }


    } catch (error) {

        return res.status(400).send(error.stack)



    }




})



exports.uploadProductsByCategoryAdmin = catchAsyncError(async (req, res, next) => {

    try {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });

        }

        req.body.images = imagesLinks;
        req.body.user = req.user.id
        const discount = req.body.discount

        if (discount) {
            const discountData = req.body.price * discount / 100
            req.body.actualpricebydiscount = req.body.price - discountData
        }
        req.body.likes = 0
        const product = await Product.create(req.body)
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        })



    } catch (error) {

        return res.status(400).send(error.stack)

    }



})


//global search ///

exports.globalSearch = catchAsyncError(async (req, res, next) => {

    try {
        const key = req.query.key

        const data = await Product.find({ $text: { $search: key } })
        return res.status(200).json({
            success: true,
            data: data

        })

    } catch (error) {
        return res.status(400).send(error.stack)
    }


})



//list of categories

exports.categoriesList = catchAsyncError(async (req, res, next) => {

    try {
        const data = await Categories.find()
        return res.status(200).json({
            success: true,
            data: data

        })

    } catch (error) {
        return res.status(400).send(error.stack)
    }


})



//get all products infinite scrolling //



exports.listOfProducts = catchAsyncError(async (req, res, next) => {

    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const keyword = req.query.keyword || '';


    try {

        const query = {
            // Build the query object for search based on keyword
            productsearch: { $regex: keyword, $options: 'i' } // Case-insensitive search on the 'name' field
        };

        const products = await Product.find(query).limit(limit)
            .skip(offset)
            .exec();

        const totalCount = await Product.countDocuments(query); // Get the total count of products

        return res.status(200).json({
            success: true,
            products: products,
            totalCount
        });




    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        })
    }

})





//product update by Dealer ///



exports.updateProductByDealer = async (req, res, next) => {

    const id = req.query.id

    try {
        const discount = req.body.discount

        if (discount) {
            const discountData = req.body.price * discount / 100
            req.body.actualpricebydiscount = req.body.price - discountData
        }


        const updateData = await Product.updateOne({ _id: id }, { $set: req.body })
        return res.status(200).json({ message: "Product Updated", success: true });

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        })
    }

}



// Get all Products By specific Dealer ///

exports.getAllProductsBySpecificDealer = async (req, res, next) => {
    const dealer_id = req.query.dealer_id;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const keyword = req.query.keyword || "";
    const cat_type = Number(req.query.category_type)
    let query;
    try {

        if (!dealer_id) {
            return res.status(400).json({ message: "Dealer Id Not Pass", success: false })
        }
        query = { dealer_id };

        if (keyword) {
            query.$or = [
                { productsearch: { $regex: keyword, $options: 'i' } },
            ];
        }
        if (cat_type) {
            query.categories = cat_type;
        }

        const totalCount = await Product.countDocuments(query);
        const data = await Product.find(query)
            .skip(offset)
            .limit(limit);

        if (data.length === 0) {
            return res.status(200).json({ message: "No Products Found", data: [], success: false });
        } else {
            return res.status(200).json({ message: "Get All Products", totalCount: totalCount, data, success: true });
        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        });
    }
}


// Delete Product By Specific Dealer ///


exports.deleteProductBySpecificDealer = async (req, res, next) => {
    const dealer_id = req.query.dealer_id;
    const product_id = req.query.product_id;

    try {
        let product = await Product.findOne({ dealer_id: dealer_id, productId: product_id })
        console.log("product",product)
        if (!product) {
            return next(new ErrorHandler("Product not found", 404))
        }
    
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
    
        await product.remove()
        return res.status(200).json({ message: "Product Deleted", success: true });


    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        });
    }
}




//Allocate Product Type to an specific Dealer /// 

exports.getAllTypesToSpecificDealer = async (req, res, next) => {
    const dealer_id = req.query.dealer_id;
    let total = []
    try {

        if (!dealer_id) {
            return res.status(400).json({ message: "Dealer Id Not Pass", success: false })
        }
        const categoriesData = await Categories.find()
        const dealer = await Dealer.find({ dealer_id: dealer_id })

        let data = dealer[0].categories
        const matchedCategories = data.map((value) => {
            return categoriesData.find((category) => category.type === value);
        });


        matchedCategories.map((ele) => {
            total.push({
                name: ele.cat_name,
                label: ele.type
            })
        })


        return res.status(200).json({ message: "get all types", success: true, data: total });

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        });
    }
}




//Get all Sizes //////////////////////////////////


exports.getSizesOfProduct = async (req, res, next) => {
    let total = []
    try {
        const sizeData = await Sizes.find()
        console.log(sizeData)

        return res.status(200).json({ message: "get all sizes", success: true, data: sizeData });

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        });
    }
}


//Add Size //

exports.addSizesOfProduct = async (req, res, next) => {
   const body  = req.body
    try {
        const sizeData = await Sizes.create(body)
        console.log(sizeData)

        return res.status(200).json({ message: "Add Product Size", success: true});

    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.stack
        });
    }
}


//Get all categories of Product //



exports.getAllCategories = async (req, res, next) => {
     try {
         const data = await Categories.find()
         return res.status(200).json({ message: "Get all Categories", data:data,success: true});
 
     } catch (error) {
         return res.status(400).json({
             success: false,
             error: error.stack
         });
     }
 }




