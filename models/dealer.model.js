const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const cookieParser = require('cookie-parser')

const dealerSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
    },

    address:{
        type:String,
    },
    aadhar_no:{
        type:String
    },
    categories:{
        type:Array,
    },
    gender:{
        type:Number
    },
    role:{
        type:Number,
        default:3
    },
    dealer_id:{
        type:String
    },
    approved_by:{
        type:String,
        default:""
    },

    approve_status:{
        type : Number,
        default:0
    },
    number: {
        type: String,
        required: [true, "Please enter your Phone Number"],
        unique: true,
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
            type: String
        },
        url: {
            type: String,
        },
    },
    created_at: {
        type: Date,
        default: () => {
            return Date.now();
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

dealerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

//creating JWT token//

dealerSchema.methods.getJWTTOKEN = async function (res) {

    
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

dealerSchema.methods.comparePassword = async function (enterPassword) {

    return await bcrypt.compare(enterPassword, this.password)

}

//reset password method//
dealerSchema.methods.getResetPasswordToken = function () {

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



module.exports = mongoose.model("Dealers", dealerSchema)