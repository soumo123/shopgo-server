const express = require('express');
const mongoose = require("mongoose")
const cors = require('cors');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const product = require('./routes/productRoute')
const message = require('./routes/messageRoute')
const cancel = require('./routes/cancelorderRoute')
const user = require('./routes/userRoute')
const order = require('./routes/orderRoute')
const payment = require("./routes/paymentRoute")
const errorMiddleware = require('./middleware/error')
const fileUpload = require('express-fileupload')
const path = require('path')


const app = express()


if(process.env.NODE_ENV!=="PRODUCTION"){
    require('dotenv').config({path:"D:/A2Z/server/config/config.env"})
}

require('./db/conn')


// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', `${process.env.REACT_CLIENT_URL}`);
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', "true");
//     next();
//    });
app.use((req, res, next) => {
    const allowedOrigins = [`${process.env.REACT_CLIENT_URL}`,`${process.env.REACT_CAT_CLIENT_URL}`];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });


app.use(cors({
    origin: [`${process.env.REACT_CLIENT_URL}`,`${process.env.REACT_CAT_CLIENT_URL}`],
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,
}))

app.use(express.json())
app.use(cookieParser())


app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

app.use('/api/soummya',product)
app.use('/api/soummya',user)
app.use('/api/soummya',order)
app.use('/api/soummya',payment)
app.use('/api/soummya',message)
app.use('/api/soummya',cancel)


// error middleware

app.use(errorMiddleware)
// app.use(express.static(path.join(__dirname,'../client/build')))

// app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname,'../client/build/index.html'))
// })



module.exports = app