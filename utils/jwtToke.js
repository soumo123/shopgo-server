const dotenv = require('dotenv')
var cookieParser = require('cookie-parser')
const Cookies = require('js-cookie')

dotenv.config({ path: "D:/A2Z/server/config/config.env" })



const sendToken = async (user, statusCode, res) => {


    const token = await user.getJWTTOKEN()
 


    res.cookie("token", token, {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        // secure:false,
        // maxAge: 1000 * 60 * 1000,
        // sameSite: 'lax', 
        // path:"/",
    })
    console.log("cookies savedr", res)
    res.status(200).send({
        success: true,
        user,
        token
    })


}

module.exports = sendToken