const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  },
});

router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
  });
});

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Max allowed size is 5MB.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || 'File upload failed',
  });
});

module.exports = router;
