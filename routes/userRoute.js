const express = require('express')
const router = express.Router()

const {registerUser,loginUser,forgotPassword,resetPassword,logout,getUserDetails,updatePassword,updateProfile,getAllUsers,getSingleUser,updateUserRole,deleteUser,OtpRequest, VerifyOtp} = require('../controllers/userController')
const {sendMessages}  = require('../controllers/messagesController')
const {isAuthenticatedUser,authorizeRoles} = require('../middleware/auth')

router.route('/register').post(registerUser)

router.route('/login').post(loginUser)

router.route('/generate/otp').put(OtpRequest)

router.route('/verify/otp').post(VerifyOtp)


router.route('/password/forgot').post(forgotPassword)

router.route('/password/reset/:token').put(resetPassword)

router.route("/me/:token").get(isAuthenticatedUser,getUserDetails)

router.route("/password/update/:token").put(isAuthenticatedUser,updatePassword)


router.route("/me/update/:token").put(isAuthenticatedUser,updateProfile)

router.route("/admin/users/:token").get(isAuthenticatedUser, authorizeRoles("admin"),getAllUsers)

router.route("/admin/user/:id/:token").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)

router.route("/admin/user/:id/:token").put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)

router.route("/admin/user/:id/:token").delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)

router.route('/logout').get(logout)

router.route('/message').post(sendMessages)

module.exports = router