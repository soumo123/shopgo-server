const app = require('./app');

const cloudinary = require('cloudinary')
// dotenv.config({path:"D:/A2Z/server/config/config.env"})


if(process.env.NODE_ENV!=="PRODUCTION"){
    require('dotenv').config({path:"D:/A2Z/server/config/config.env"})
}

const server = app.listen(process.env.PORT,()=>{
    console.log(`server is running at port ${process.env.PORT}`)
})




cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET_KEY
})


//unhandle error handle of mongoDb//

process.on('uncaughtException',(err)=>{
    console.error(`Error:${err.message}`)
    console.log("Shutting down the server due to unhandle promise rejection")

    server.close(()=>{
        process.exit(1)
    })
})


