const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const cookieParser = require('cookie-parser')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "name should be have more than 4 chracters"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter valid email"]
    },
    number: {
        type: Number,
        required: [true, "Please enter your Phone Number"],
        unique: true,
        maxLength: [10, "Number cannot exceed 10"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [4, "password must be grater 4 characters"],
        select: false
    },

    otp:{
        type:Number
    },

    avatar: {
        public_id:
        {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

//creating JWT token//

userSchema.methods.getJWTTOKEN = async function (res) {

    
    const token = jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
    console.log("generate token",token)

    await this.save()
    return token
    
    // return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRE
    // })


}

//password matchh //

userSchema.methods.comparePassword = async function (enterPassword) {

    return await bcrypt.compare(enterPassword, this.password)

}

//reset password method//
userSchema.methods.getResetPasswordToken = function () {

    //generate token//
    const resetToken = crypto.randomBytes(20).toString("hex")

    //password hash//
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")


    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    return resetToken
}



module.exports = mongoose.model("User", userSchema)