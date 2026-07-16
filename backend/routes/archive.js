const express = require('express');
const router = express.Router();

// ----------------------------------------
// Folders Routes
// ----------------------------------------
router.get('/folders', async (req, res) => {
    try {
        const Folder = req.tenantConnection.model('Folder');
        // Fetch root folders (parentFolderId is null or not provided)
        const filter = req.query.parentId ? { parentFolderId: req.query.parentId } : { parentFolderId: null };
        const folders = await Folder.find(filter);
        res.json(folders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching folders', error: error.message });
    }
});

router.post('/folders', async (req, res) => {
    try {
        const Folder = req.tenantConnection.model('Folder');
        const newFolder = await Folder.create(req.body);
        res.status(201).json(newFolder);
    } catch (error) {
        res.status(400).json({ message: 'Error creating folder', error: error.message });
    }
});

// ----------------------------------------
// Files Routes
// ----------------------------------------
router.get('/files', async (req, res) => {
    try {
        const File = req.tenantConnection.model('File');
        const filter = req.query.folderId ? { folderId: req.query.folderId } : { folderId: null };
        const files = await File.find(filter).populate('uploadedBy', 'name email');
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
});

router.post('/files', async (req, res) => {
    try {
        // In a real scenario, you'd use something like multer to handle the multipart form-data upload
        // For this skeleton, we are just saving the metadata provided in the request body
        const File = req.tenantConnection.model('File');
        const newFile = await File.create(req.body);
        res.status(201).json(newFile);
    } catch (error) {
        res.status(400).json({ message: 'Error saving file metadata', error: error.message });
    }
});

module.exports = router;
