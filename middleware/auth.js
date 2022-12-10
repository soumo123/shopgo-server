const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('./catchAsyncError')
const User = require('../models/userModels')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config({path:"D:/A2Z/server/config/config.env"})



exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{

    
    
    const  token = req.params.token
    
  
    if(!token){
        return next(new ErrorHandler('Please login to access the resource',401))
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decodedData.id)
    next()
    
        
    
   
  
}) 

exports.authorizeRoles = (...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next (new ErrorHandler(`Role:${req.user.role}is not allowed to access this resource`,403)
            )}
        next()
    }
}