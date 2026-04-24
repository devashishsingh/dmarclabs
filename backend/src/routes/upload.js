const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const config = require('../config/env');
const { createSession } = require('../services/sessionManager');

const MAX_FILE_BYTES = config.maxFileSizeMB * 1024 * 1024;

// Store uploads in OS temp dir; cleaned up by session purge or cron
const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.xml';
    const safe = `dmarc-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safe);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.xml') {
    cb(null, true);
  } else {
    const err = new Error('Only .xml DMARC report files are accepted');
    err.status = 415;
    err.code = 'INVALID_FILE_TYPE';
    cb(err);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter,
});

const router = express.Router();

router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'No file was uploaded' });
    }

    const sessionId = createSession({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
    });

    return res.status(200).json({
      sessionId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'uploaded',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
