const dotenv = require('dotenv')
var cookieParser = require('cookie-parser')
const Cookies = require('js-cookie')
const WebEncryption = require('../utils/decrypt')
const axios = require("axios")
const WebCrypto = new WebEncryption(process.env.decryptKey);

dotenv.config({ path: "D:/A2Z/server/config/config.env" })



const sendToken = async (user, statusCode, res) => {

    let userData = {}
    // const token = await user.getJWTTOKEN()
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
        userData.created_at = user.created_at

    return res.status(200).send({
        success: true,
        user: userData,
        token
    })


}














module.exports = sendToken