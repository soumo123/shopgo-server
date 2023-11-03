const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModels')
const sendToken = require('../utils/jwtToke')
const sendToken1 = require('../utils/jwtTokenUser')

const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const { find } = require('../models/userModels')
const nodemailer = require('nodemailer');
const Dealer = require('../models/dealer.model.js')
const WebEncryption = require('../utils/decrypt.js')
const getNextSequentialId = require('../utils/generateId.js')
const veriFyAadhar = require('../utils/aadharVerfication.js')
const axios = require("axios")
//user registration//

const WebCrypto = new WebEncryption(process.env.decryptKey);



exports.registerUser = catchAsyncError(async (req, res, next) => {

    try {

        const myCloud = await cloudinary.v2.uploader.upload_large(req.body.avatar, {
            folder: "avatars",
            width: 400,
            height: 450,
            quality: 100,
            crop: "scale",
        });

        const { name, email, password, number } = req.body
        const isEmail = await User.find({ email: email })

        if (isEmail.length > 0) {
            return res.status(400).json({ message: "Email Already Present", status: false })
        }
        const user = await User.create({
            name, email, password, number,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        })
        sendToken(user, 200, res)


    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Registration Unsuccesfull", error: error.stack })
    }

})
//Login User//

exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body

    //if email and password not putting//
    if (!email || !password) {
        // return next(new ErrorHandler('Please enter email and password', 400))
        return res.status(400).send({ message: "Please enter email and password", success: false })

    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {

        // return next(new ErrorHandler('Invalid email and password', 401))
        return res.status(400).send({ message: "Invalid email Or password", success: false })
    }

    const isPasswordMatch = await user.comparePassword(password);


    if (!isPasswordMatch) {
        // return next(new ErrorHandler('Invalid email and password', 401))
        return res.status(400).send({ message: "Invalid email Or password", success: false })


    }

    sendToken1(user, 200, res)

})

//logout user// 


exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 1000,
        sameSite: 'lax',
        path: "/",
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

    const resetToken = user.getResetPasswordToken()

    console.log("reset token :", resetToken)

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
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    console.log(user)

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400))

    }
    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()
    sendToken(user, 200, res)
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

    if (req.body.newPassword !== req.body.confirmPassword) {

        return next(new ErrorHandler('password does not match', 400))
    }

    user.password = req.body.newPassword
    await user.save()
    sendToken(user, 200, res)

})

//update user profile////

exports.updateProfile = catchAsyncError(async (req, res, next) => {

    try {
        const newUserData = {
            name: req.body.name
        }


        if (req.body.avatar !== "") {
            const user = await User.findById(req.user.id)
            const imageId = user.avatar.public_id
            await cloudinary.v2.uploader.destroy(imageId)

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        } else {
            const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            })
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).json({
            success: true,
            message: "User updated succesfully.."
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "User Not Update",
            error: error.stack
        })
    }


})

//get single user by admin user


exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const name = req.query.name
    let users;

    if (name) {
        users = await User.find({ name: { $regex: '.*' + name + '.*', $options: 'i' } })

    } else {
        users = await User.find()
    }

    res.status(200).json({
        success: true,
        users
    })
})

//get all users by admin//

exports.getSingleUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
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
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }


    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "User updated succesfully..",
        user
    })
})


//delete user --Admin//

exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler(`user does not exist in this ${req.params.id}`, 400))
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
        const { number } = req.body
        const user = await User.findOne({ number: number })
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

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                return await res.status(400).send(JSON.stringify({ success: false, error }));

            } else {
                return res.status(200).send({ message: "Otp Send Succesfully", success: true })
            }
        });


    } catch (error) {
        return res.status(400).send({ message: "Otp Not Send", error: error.stack, success: false })


    }

})


exports.VerifyOtp = catchAsyncError(async (req, res, next) => {

    try {
        const { otp } = req.body
        const user = await User.findOne({ otp: otp })
        console.log("user", user)

        if (otp == user.otp) {
            sendToken(user, 200, res)
            // return res.status(200).send({message:"Login Succesfully", success:true})
        } else {
            return res.status(400).send(JSON.stringify({ success: false }));

        }

    } catch (error) {
        return res.status(400).send({ message: "Wrong OTP", error: error.stack, success: false })


    }




})



//Register Dealer ///
exports.registerDealer = async (req, res) => {
    try {

        const myCloud = await cloudinary.v2.uploader.upload_large(req.body.avatar, {
            folder: "avatars",
            width: 400,
            height: 450,
            quality: 100,
            crop: "scale",
        });

        const { name, email, password, number, address, aadhar_no, categories, gender } = req.body
        const isEmail = await Dealer.find({ email: email })


        console.log("req.body", req.body)
        if (isEmail.length > 0) {
            return res.status(400).json({ message: "Email Already Present", status: false })
        }

        const lastId = await getNextSequentialId("SD")

        const newName = WebCrypto.encrypt(name)
        // const newEmail = WebCrypto.encrypt(email)
        const newNumber = WebCrypto.encrypt(number)
        const newAddress = WebCrypto.encrypt(address)
        const newAadhar = WebCrypto.encrypt(aadhar_no)

        const user = await Dealer.create({
            name: newName, email: email, password, number: newNumber, address: newAddress, aadhar_no: newAadhar, categories: categories, gender, dealer_id: lastId,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
            // avatar: {
            //     public_id:"",
            //     url: ""
            // }
        })
        // sendToken(user, 200, res)

        return res.status(201).json({ success: true, message: `Registration Successfull` })
    } catch (error) {
        console.log(error.stack)
        return res.status(400).json({ error: error.stack })
    }
}

//Admin Approved Dealer Status //

exports.approvedDealerByAdmin = async (req, res) => {
    const dealer_id = req.query.id
    const approvedBy_id = req.query.approve_id

    try {

        let userData = {
            approved_by: approvedBy_id,
            approve_status: 1
        }
        const user = await Dealer.updateOne({ dealer_id: dealer_id }, { $set: userData })
        return res.status(200).json({ success: true, message: `Dealer Approved` })
    } catch (error) {
        console.log(error.stack)
        return res.status(400).json({ error: error.stack })
    }
}

//Aaadhar Card Verification// 

exports.aadharVerfication = async (req, res) => {

    const card_no = req.body.aadhar_no
    try {

        const result = await veriFyAadhar(card_no)
        console.log("resulttttttttttttttt", result)

        return res.status(200).json({ success: result })
    } catch (error) {
        console.log(error.stack)
        return res.status(400).json({ error: error.stack })
    }
}



//Product Upload ///











// Dealer Login //

exports.DealerLogin = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body

    //if email and password not putting//
    if (!email || !password) {
        // return next(new ErrorHandler('Please enter email and password', 400))
        return res.status(400).send({ message: "Please enter email and password", success: false })

    }

    const user = await Dealer.findOne({ email }).select('+password')

    if (!user) {

        // return next(new ErrorHandler('Invalid email and password', 401))
        return res.status(400).send({ message: "Invalid email Or password", success: false })
    }

    const isPasswordMatch = await user.comparePassword(password);


    if (!isPasswordMatch) {
        // return next(new ErrorHandler('Invalid email and password', 401))
        return res.status(400).send({ message: "Invalid email Or password", success: false })


    }

    sendToken(user, 200, res)

})




//Get Dealers Data //



exports.getUser = async (req, res, next) => {

    const dealer_id = req.query.dealer_id
    let userData = {}

    const user = await Dealer.findOne({ dealer_id: dealer_id })

    if (!user) {
        return res.status(400).send({ status: false, message: "Not Found" })
    }
    let token;

    const data = JSON.stringify({
        "email": "soummyabiswas555@gmail.com",
        "password": "Soummya@123"
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            token = response.data.token;
        })
        .catch(function (error) {
            console.log(error);
        });

    userData.name = WebCrypto.decrypt(user.name)
    userData.email = user.email
    userData.approve_status = user.approve_status
    userData.categories = user.categories
    userData.address = WebCrypto.decrypt(user.address)
    userData.number = WebCrypto.decrypt(user.number)
    userData.dealer_id = user.dealer_id
    userData.gender = user.gender
    userData.role = user.role
    userData.avatar = user.avatar
    userData.created_at  = user.created_at
    userData.token = token
    return res.status(200).send({status:true,data:userData})
   

}