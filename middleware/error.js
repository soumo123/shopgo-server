const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"

    //wrong mongoDb Id error handle////////

    if (err.name === "CastError") {
        const message = `Resource Not Found:${err.path}`
        err = new ErrorHandler(message, 400)
    }

//mongoos duplicate key error//

if(err.code === 11000){
    const message = `Duplicate ${Object.keys(err.keyValue)} entered `
    err = new ErrorHandler(message,400)
}

//jsonwebtoken error handle////////

if(err.name === 'jsonWebTokenError'){
    const message = `Json webtoken is invalid , try again later`
    err = new ErrorHandler(message,400)
}

//JWT expire error

if(err.name === 'TokenExpiredError'){
    const message = `Json webtoken is Expired , try again later`
    err = new ErrorHandler(message,400)
}

   

    
    res.status(err.statusCode).json({
        success: false,
        error: err.stack
    })
}

