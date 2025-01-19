const express = require('express');
const { uploadFile } = require('../controllers/handleContentAnalysisController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Route to upload and process file
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
