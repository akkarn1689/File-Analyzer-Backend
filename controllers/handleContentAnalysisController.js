const fs = require('fs');
const path = require('path');
const { processWithGemini } = require('../utils/geminiProcessors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

        const { mimetype, path: filePath } = req.file;
        const fileData = fs.readFileSync(filePath);
        const base64File = fileData.toString('base64');

        // Process the file using Gemini
        const extractedData = await processWithGemini(base64File, mimetype);

        fs.unlinkSync(filePath); // Clean up the uploaded file

        res.json({ success: true, data: extractedData });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
