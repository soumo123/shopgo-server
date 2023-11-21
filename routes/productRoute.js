const express = require('express')
const router = express.Router()
const {getAllproducts,createProduct,updateProduct,deleteProduct,getProductDetails,createProductReview,getProductReviews,deleteProductReviews,getAdminproducts, getDiscountProduct, likeProduct, likeProductUpdate, getLikeProducts, getAllProductsByCategoryAdmin, uploadProductsByCategoryAdmin, globalSearch, categoriesList, listOfProducts, updateProductByDealer, getAllProductsBySpecificDealer, deleteProductBySpecificDealer, getAllTypesToSpecificDealer, getSizesOfProduct, addSizesOfProduct, getAllCategories, AllProducts, types} = require('../controllers/productController')
const { isAuthenticatedUser, authorizeRoles ,authorizeRolesforCategory} = require('../middleware/auth')


router.route('/products').get(getAllproducts)
router.route('/product/:id').get(getProductDetails)
// router.route('/admin/product/new/:token').post(isAuthenticatedUser, authorizeRoles("admin"),createProduct)
router.route('/admin/product/new').post(createProduct)

router.route('/admin/product/:id').put(updateProduct)
router.route('/admin/product/:id/:token').delete(isAuthenticatedUser, authorizeRoles("admin"),deleteProduct)
router.route("/review/:token").put(isAuthenticatedUser,createProductReview)
router.route("/reviews").get(getProductReviews)
router.route("/reviews").delete(deleteProductReviews)
router.route("/categories").get(categoriesList)

router.route("/listofproducts").get(listOfProducts)

router.route("/discountProducts").get(getDiscountProduct)
router.route("/like/:id/:token").put(isAuthenticatedUser,likeProductUpdate)
router.route("/likes").get(getLikeProducts)
router.route("/admin/products/:token").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminproducts)




router.route("/dealer/product/update").put(updateProductByDealer)

router.route("/dealer/getAllProducts").get(getAllProductsBySpecificDealer) 


router.route("/dealer/deleteProduct").delete(deleteProductBySpecificDealer)


router.route("/dealer/get_types").get(getAllTypesToSpecificDealer)

router.route("/dealer/sizes").get(getSizesOfProduct)

router.route("/dealer/add_size").post(addSizesOfProduct)


router.route("/dealer/categories").get(getAllCategories)

router.route("/types").get(types)








//categorty Admin------------->>>>>>>>

router.route("/cat-admin/products/:token/:user_id").get(isAuthenticatedUser,getAllProductsByCategoryAdmin)
router.route("/cat-admin/product/new/:token").post(isAuthenticatedUser,uploadProductsByCategoryAdmin)
router.route('/cat-admin/product/:id/:token').put(isAuthenticatedUser,updateProduct)


router.route('/search-data').get(globalSearch)



router.route('/all_products').post(AllProducts)




module.exports = router

