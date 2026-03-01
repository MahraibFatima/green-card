const router = require('express').Router();
const User = require('../models/user'); 
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpires: verificationTokenExpires
        });
        
        await user.save();
        
        const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
        
        
        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify Your Email',
                html: `
                    <h1>Email Verification</h1>
                    <p>Hello ${name || 'User'},</p>
                    <p>Thank you for registering. Please click the link below to verify your email address:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>Or copy and paste this link: ${verificationLink}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
             }
        
        res.status(201).json({ 
            message: 'User registered successfully! Please check your email to verify your account.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'User not found. Please sign up first.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(200).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(200).json({ 
                message: 'Please verify your email before logging in.',
                isVerified: false,
                email: user.email
            });
        }
        
        const { password: _, ...userWithoutPassword } = user._doc;
        
        res.status(200).json({ 
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }
       
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() } 
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Email verification failed' });
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }
        
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();
        
        const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
        
        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email - Resend',
            html: `
                <h1>Email Verification</h1>
                <p>Hello ${user.name || 'User'},</p>
                <p>Here is your new verification link:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy and paste this link: ${verificationLink}</p>
                <p>This link will expire in 24 hours.</p>
            `
        });
        
        res.status(200).json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Failed to resend verification email' });
    }
});

router.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
});

router.post('/seller/register', async (req, res) => {
    try {
        const { name, email, password, shopName, shopPhone } = req.body;
        
        const existingSeller = await User.findOne({ email });
        if (existingSeller) {
            return res.status(200).json({ message: 'Email already registered' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
        
        const seller = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: 'seller',
            shopName,
            shopPhone,
            verificationToken: verificationToken,
            verificationTokenExpires: verificationTokenExpires
        });
        
        await seller.save();
        
        const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
        
        try {
            await sendEmail({
                to: seller.email,
                subject: 'Verify Your Seller Account',
                html: `
                    <h1>Seller Account Verification</h1>
                    <p>Hello ${name || 'Seller'},</p>
                    <p>Welcome to our platform! Please click the link below to verify your seller account:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Account</a>
                    <p>Or copy and paste this link: ${verificationLink}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>Shop Name: ${shopName}</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }
        
        res.status(201).json({ 
            message: 'Seller registered successfully! Please check your email to verify your account.',
            seller: {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                shopName: seller.shopName,
                isVerified: seller.isVerified
            }
        });
    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/seller/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const seller = await User.findOne({ email, role: 'seller' });
        if (!seller) {
            return res.status(200).json({ message: 'Seller account not found. Please sign up first.' });
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password);
        if (!isPasswordValid) {
            return res.status(200).json({ message: 'Invalid credentials' });
        }

        if (!seller.isVerified) {
            return res.status(200).json({ 
                message: 'Please verify your email before logging in.',
                isVerified: false,
                email: seller.email
            });
        }
        
        const { password: _, ...sellerWithoutPassword } = seller._doc;
        
        res.status(200).json({ 
            message: 'Login successful',
            seller: sellerWithoutPassword
        });
    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;