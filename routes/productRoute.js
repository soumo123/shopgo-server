const express = require('express')
const router = express.Router()
const {getAllproducts,createProduct,updateProduct,deleteProduct,getProductDetails,createProductReview,getProductReviews,deleteProductReviews,getAdminproducts, getDiscountProduct, likeProduct, likeProductUpdate, getLikeProducts, getAllProductsByCategoryAdmin, uploadProductsByCategoryAdmin} = require('../controllers/productController')
const { isAuthenticatedUser, authorizeRoles ,authorizeRolesforCategory} = require('../middleware/auth')


router.route('/products').get(getAllproducts)
router.route('/product/:id').get(getProductDetails)
router.route('/admin/product/new/:token').post(isAuthenticatedUser, authorizeRoles("admin"),createProduct)
router.route('/admin/product/:id/:token').put(isAuthenticatedUser, authorizeRoles("admin"),updateProduct)
router.route('/admin/product/:id/:token').delete(isAuthenticatedUser, authorizeRoles("admin"),deleteProduct)
router.route("/review/:token").put(isAuthenticatedUser,createProductReview)
router.route("/reviews").get(getProductReviews)
router.route("/reviews").delete(deleteProductReviews)


router.route("/discountProducts").get(getDiscountProduct)
router.route("/like/:id/:token").put(isAuthenticatedUser,likeProductUpdate)
router.route("/likes").get(getLikeProducts)
router.route("/admin/products/:token").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminproducts)





//categorty Admin------------->>>>>>>>

router.route("/cat-admin/products/:token").post(isAuthenticatedUser,getAllProductsByCategoryAdmin)
router.route("/cat-admin/product/new/:token").post(isAuthenticatedUser,uploadProductsByCategoryAdmin)
router.route('/cat-admin/product/:id/:token').put(isAuthenticatedUser,updateProduct)






module.exports = router

