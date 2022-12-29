const express = require('express')
const router = express.Router()
const {sendMessages}  = require('../controllers/messagesController')


router.route('/message').get(sendMessages)
module.exports = router