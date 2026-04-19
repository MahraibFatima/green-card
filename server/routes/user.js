const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

const router = express.Router();

const profileUploadDir = path.join(__dirname, '..', 'uploads', 'profile-images');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const profileImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profileUploadDir),
  filename: (req, file, cb) => {
    const userId = req.body.userId || 'user';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

const imageUpload = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

router.put('/profile', async (req, res) => {
  try {
    const { userId, name, email, addresses } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (typeof name === 'string') {
      user.name = name.trim();
    }

    if (typeof email === 'string') {
      user.email = email.trim();
    }

    const incomingAddress = Array.isArray(addresses) ? addresses[0] : null;

    if (incomingAddress) {
      const street = (incomingAddress.street || '').trim();
      const city = (incomingAddress.city || '').trim();
      const state = (incomingAddress.state || '').trim();
      const country = (incomingAddress.country || '').trim();
      const phone = (incomingAddress.phone || '').trim();
      const zipcode = Number(incomingAddress.zipcode);

      const hasAnyAddressField = [street, city, state, country, phone, incomingAddress.zipcode]
        .some((value) => String(value ?? '').trim() !== '');

      if (hasAnyAddressField) {
        if (!street || !city || !state || !country || !phone || Number.isNaN(zipcode)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide complete address details including zipcode.',
          });
        }

        const [firstName = '', ...rest] = (user.name || '').trim().split(' ');
        const lastName = rest.join(' ') || 'NA';

        user.addresses = [{
          firstName: firstName || 'NA',
          lastName,
          email: user.email,
          street,
          city,
          state,
          zipcode,
          country,
          phone,
        }];
      }
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

router.post('/upload-profile-image', imageUpload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imagePath = `/uploads/profile-images/${req.file.filename}`;
    const imageUrl = `${req.protocol}://${req.get('host')}${imagePath}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
});

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Image size should be less than 5MB',
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || 'Upload failed',
  });
});

module.exports = router;
