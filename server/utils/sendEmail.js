const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        console.log('Attempting to send email to:', to);
        
        const info = await transporter.sendMail({
            from: `"Green Cart" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:');
        console.error('Error:', error.message);
        console.error('Email config:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            hasPassword: !!process.env.EMAIL_PASSWORD
        });
        throw error;
    }
}

module.exports = sendEmail;