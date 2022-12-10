const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')
const nodemailer = require('nodemailer');

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


exports.sendMessages = catchAsyncError(async (req, res,next) => {
  


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD
        }
      });
      
      const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: req.body.to,
        envelope: {
          from: process.env.NODEMAILER_EMAIL,
          to: req.body.to
        },
        subject: "shopgo.com",
        html: '<b><p>Your order will delivered withing 4-5 days . Thank you for ordering...</p></b>'
      };

    transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
            return await res.status(400).send(JSON.stringify({ success: false, error }));
        } else {
          client.messages
          .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: "+919874266014",
            body: "Someone Order product ...please check"
          })
          .then(() => {
            return res.status(200).send(JSON.stringify({ success: true,message:"Send Succesfully" }));
          })
          .catch(err => {
           
            return res.status(400).send(JSON.stringify({ success: false,error:err.stack }));
          });
      
            return await res.status(200).send(JSON.stringify({ success: true,info,message:"Send Succesfully" }));
        }
      });





})