const express = require('express');
const router = express.Router();
const { createMeeting } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

// Route requires a valid Bearer token, then generates the room layout
router.post('/create', protect, createMeeting);

module.exports = router;
