const express = require('express')
const router = express.Router()
const {sendMessages}  = require('../controllers/messagesController')


router.route('/message').post(sendMessages)
module.exports = router