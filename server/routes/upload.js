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
  'image/svg+xml',
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

// ---- GridFS upload: store file in MongoDB ----
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  },
});

const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

router.post('/db/single', uploadMemory.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        uploadedAt: new Date(),
      },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
      const fileId = uploadStream.id;
      const fileUrl = `${req.protocol}://${req.get('host')}/api/upload/db/${fileId}`;
      return res.status(201).json({
        success: true,
        file: {
          id: fileId,
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      });
    });

    uploadStream.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
});

// stream file from GridFS by id
router.get('/db/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send('Invalid file id');

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const _id = new ObjectId(id);
    const files = await db.collection('uploads.files').findOne({ _id });
    if (!files) return res.status(404).send('File not found');

    res.set('Content-Type', files.contentType || 'application/octet-stream');
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
    downloadStream.on('error', () => res.sendStatus(404));
  } catch (err) {
    res.status(500).send('Server error');
  }
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
