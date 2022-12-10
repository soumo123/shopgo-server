
const mongoose = require('mongoose')

process.on('uncaughtException',(err)=>{
  console.error(`Error:${err.message}`)
  console.log("Shutting down the server due to unhandle promise rejection")
  process.exit(1)
})


if(process.env.NODE_ENV!=="PRODUCTION"){
  require('dotenv').config({path:"D:/A2Z/server/config/config.env"})
}


const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD


const URL = `mongodb://${username}:${password}@cluster0-shard-00-00.ruauk.mongodb.net:27017,cluster0-shard-00-01.ruauk.mongodb.net:27017,cluster0-shard-00-02.ruauk.mongodb.net:27017/ecomerce?ssl=true&replicaSet=atlas-3x9kgv-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
  console.log(`Connection is succesful`)
}).catch((err)=> console.log('No connection'))

