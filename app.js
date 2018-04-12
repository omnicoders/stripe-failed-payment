const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = JSON.parse(fs.readFileSync('config.json').toString());

const stripe = require('stripe')(config.stripe_secret);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.smtp_email,
        pass: config.smtp_password
    }
});

app.use(bodyParser.json());


app.post('/invoice-payment-failed',  (req, res) => {

    stripe.events.retrieve(req.body.id, (err, event) => {

        if (err) {
            console.log(err);
            return;
        }

        stripe.customers.retrieve(event.data.object.customer, (err, customer) => {
            const email = customer.email;
            const mailOptions = {
                from: config.smtp_email,
                to: email,
                subject: 'Your Payment Failed',
                text: 'Sorry your payment Failed, please update your payment information.'
            };

            const mailOptionsAdmin = {
                from: config.smtp_email,
                to: config.admin_emails.join(', '),
                subject: 'Your Payment Failed',
                text: 'Sorry your payment Failed, please update your payment information.'

            }

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            transporter.sendMail(mailOptionsAdmin, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Admin sent: ' + info.response);
                }
            });

        })
    });

    res.send('Ok');
});




app.listen(3000,  () => {
    console.log('Example app listening on port 3000!');
});