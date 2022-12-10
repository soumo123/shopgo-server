const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModels')
const sendToken = require('../utils/jwtToke')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const { find } = require('../models/userModels')
const nodemailer = require('nodemailer');

//user registration//

exports.registerUser = catchAsyncError(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

    const { name, email, password,number } = req.body
    // const isEmail = await User.find({email:email})
    // if(isEmail){
    //     return next(new ErrorHandler('Email Already Present', 400))

    // }
    const user = await User.create({
        name, email, password,number,
        avatar: {
            public_id: myCloud.public_id,
            url:myCloud.secure_url
        }
    })
    sendToken(user, 200, res)
})

//Login User//

exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body

    //if email and password not putting//
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {

        return next(new ErrorHandler('Invalid email and password', 401))
    }

    const isPasswordMatch = await user.comparePassword(password);
  
    
    if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid email and password', 401))
       
        
    }
   
    sendToken(user,200,res)
 
})

//logout user// 


exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure:false,
        maxAge: 1000 * 60 * 1000,
        sameSite: 'lax', 
        path:"/",
    })

    res.status(200).json({
        success: true,
        message: "Logout Successfully"
    })

})
// forgot password //

exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    const resetToken =  user.getResetPasswordToken()

    console.log("reset token :",resetToken)

    await user.save({ validateBeforeSave: true })

    //reset password link////

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/soummya/password/reset/${resetToken}`

    console.log("resetPasswordUrl :", resetPasswordUrl)
    //sending the meaasge////////////////

    const message = `Your password reset token is : \n\n  ${resetPasswordUrl} \n\n If you have not requested  this mail then please ignore it`

    console.log("message :", message)

    try {
         await sendEmail({
            email: user.email,
            subject: `A2Z Password recovery`,
            message
        })

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} succesfully`
        })

    

    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))

    }
})


//reset password////

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    console.log(user)

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match", 400))

    }
    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()
    sendToken(user,200,res)
})

//get user details////

exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    
    const user = await User.findById(req.user.id)

     res.status(200).json({
        success: true,
        user
    })
})

//update user password////

exports.updatePassword = catchAsyncError(async (req, res, next) => {

const user = await User.findById(req.user.id).select("+password")

const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

if (!isPasswordMatch) {

    return next(new ErrorHandler('Old password is incorrect', 400))
}

if(req.body.newPassword !== req.body.confirmPassword){

    return next(new ErrorHandler('password does not match', 400))
}

user.password = req.body.newPassword
await user.save()
sendToken(user, 200, res)

})

//update user profile////

exports.updateProfile = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }


    if(req.body.avatar !==""){
        const user = await User.findById(req.user.id)    
        const imageId = user.avatar.public_id
        await cloudinary.v2.uploader.destroy(imageId)

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
          });

          newUserData.avatar = {
            public_id:myCloud.public_id,
            url:myCloud.secure_url
          }

    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
        message:"User updated succesfully.."
    })
})

//get single user by admin user


exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

//get all users by admin//

exports.getSingleUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(`User does not exits ${req.params.id} this Id`, 400))
    }
    res.status(200).json({
        success: true,
        user
    })
})


/// change user role --Admin //


exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

 
    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
        message:"User updated succesfully..",
        user
    })
})


//delete user --Admin//

exports.deleteUser = catchAsyncError(async (req, res, next) => {

 const user = await User.findById(req.params.id)

 if(!user){
     return next(new ErrorHandler(`user does not exist in this ${req.params.id}`,400))
 }

 const imageId = user.avatar.public_id
await cloudinary.v2.uploader.destroy(imageId)

 await user.remove()

    res.status(200).json({
        success: true,
        message: `User deleted successfully`
    })
})




exports.OtpRequest = catchAsyncError(async (req, res, next) => {

    try {
        const {number } = req.body
        const user = await User.findOne({number:number})    
        const otp = Math.floor(1000 + Math.random() * 9000);
    
        user.otp = otp
        await user.save()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.NODEMAILER_EMAIL,
              pass: process.env.NODEMAILER_PASSWORD
            }
          });
          
          const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.email,
            envelope: {
              from: process.env.NODEMAILER_EMAIL,
              to: user.email
            },
            subject: "shopgo.com",
            html: `<b><p>Your Otp is - ${otp}</p></b>`
          };

          transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
                return await res.status(400).send(JSON.stringify({ success: false, error }));

            } else {
                return res.status(200).send({message:"Otp Send Succesfully", success:true})
            }
          });
    
        
    } catch (error) {
        return res.status(400).send({message:"Otp Not Send",error:error.stack, success:false})

        
    }



   
})



exports.VerifyOtp = catchAsyncError(async (req, res, next) => {

    try {
        const {otp} = req.body
        const user = await User.findOne({otp:otp})  
        console.log("user",user)  
        
        if(otp==user.otp){
            sendToken(user,200,res)
            // return res.status(200).send({message:"Login Succesfully", success:true})
        }else{
            return  res.status(400).send(JSON.stringify({ success: false }));

        }

    } catch (error) {
        return res.status(400).send({message:"Wrong OTP",error:error.stack, success:false})

        
    }



   
})