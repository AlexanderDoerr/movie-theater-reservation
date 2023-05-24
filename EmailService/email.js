const nodemailer = require('nodemailer');

module.exports = (userEmail,subject,text) =>
{
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'alexkugle@gmail.com',
            pass: 'titpnsscfjsgnayj'
        }
    });
    
    let mailOptions = {
        from: 'alexkugle@gmail.com',
        to: userEmail,
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
        
}