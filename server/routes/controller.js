const crypto = require('crypto');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail'); 

async function registerUser(userData) {
    try {
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        const user = new User({
            name: userData.name,
            email: userData.email,
            password: userData.password, 
            verificationToken: verificationToken,
            verificationTokenExpires: verificationTokenExpires
        });
        
        await user.save();
        
        const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
        
        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email',
            html: `
                <h1>Email Verification</h1>
                <p>Click the link below to verify your email:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 24 hours.</p>
            `
        });
        
        return { success: true, message: 'Registration successful! Please verify your email.' };
    } catch (error) {
        throw error;
    }
}

module.exports = { registerUser };