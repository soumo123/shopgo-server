const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')
const cloudinary = require("cloudinary");


//create product by admin//
exports.createProduct = catchAsyncError(async (req, res, next) => {

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

    if(discount){
      const discountData = req.body.price * discount/100
        req.body.actualpricebydiscount = req.body.price - discountData
    }
    req.body.likes = 0
    const product = await Product.create(req.body)
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    })

})



//get all products//

exports.getAllproducts = catchAsyncError(async (req, res,next) => {

    //for pagiation//
    
    const resultPerPage = 8
    const productscount = await Product.countDocuments()

    const apifeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
    
    let products  =  await apifeatures.query
    let filterProductsCount = products.length

    apifeatures.pagination(resultPerPage)
    products  =  await apifeatures.query
    
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

exports.getAdminproducts = catchAsyncError(async (req, res,next) => {

  const products = await Product.find()
    
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
    
    if(discount){
      const discountData = req.body.price * discount/100
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
        (rev)=>rev._id.toString() !==req.query.id.toString()
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
    },{

        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
        message: 'Reviews deleted successfully'
    })
})



exports.getDiscountProduct = catchAsyncError(async (req, res,next) => {

try {
     
   const products = await Product.find()
    
   const dealproducts =  products.filter((ele)=>{
    if(ele.discount > 0){
        return true
    }
   })

   return res.status(200).json({
    success: true,
    dealproducts
})
}catch (error) {
    return res.status(400).json({
        success: false,
        error:error.stack
    })
}

})












exports.likeProductUpdate = catchAsyncError(async (req, res, next) => {

    try {
        const newLike = req.query.likes
        const nowLike = Number(newLike)
      
       const products = await Product.findById(req.params.id)
      
       products.likes =  products.likes + nowLike
      
       await products.save()

        return res.status(200).json({
            success: true,
            products
     })
    } catch (error) {
        return res.status(400).json({
            success: false,
            error:error.stack
        })
    }
   
})







//get like products

exports.getLikeProducts = catchAsyncError(async (req, res,next) => {

    try {
     
        const products = await Product.find()
         
        const likebleProducts =  products.filter((ele)=>{
         if(ele.likes > 0){
             return true
         }
        })
     
        return res.status(200).json({
         success: true,
         likebleProducts
     })
     }catch (error) {
         return res.status(400).json({
             success: false,
             error:error.stack
         })
     }
    
    })
    