const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);




exports.sendMessages = catchAsyncError(async (req, res,next) => {
  
  let name = req.body.name

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
        html: `<b><p>Thank You ${name} , Your order will delivered withing 4-5 days . Thank you for ordering...</p></b>`

      };


    transporter.sendMail(mailOptions, async function(error, info){
        if (error) {
        
           return await res.status(400).send({ success: false, error:error.stack });
        } else {
          client.messages
          .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: "+919874266014",
            body: `${name} Order product ...please check`
          })
          .then(() => {
             return res.status(200).send({ success: true,message:"Send Succesfully" });
          
          })
          .catch(err => {
           console.log(error.stack)
            return res.status(400).send({ success: false,error:err.stack });
            
          });
      
            return await res.status(200).send({ success: true,info,message:"Send Succesfully" });
        }
      });

})
