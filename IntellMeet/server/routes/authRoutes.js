const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary'); // Import our multer-cloudinary config utility

// Day 2 Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Day 3 Routes
router.get('/me', protect, getMe);
// Route takes: 1. Authorization check -> 2. Intercepts file upload input key named 'avatar' -> 3. Fires controller updates
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
