const Meeting = require('../models/Meeting');

// @desc    Create a new meeting room instance
// @route   POST /api/meetings/create
// @access  Private
exports.createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a meeting title' });
    }

    // Generate a unique 9-character random room code (like abc-def-ghi)
    const randomCode = Math.random().toString(36).substring(2, 11);
    const meetingCode = `${randomCode.slice(0,3)}-${randomCode.slice(3,6)}-${randomCode.slice(6,9)}`;

    // Create the database record, setting the logged-in user as the host
    const meeting = await Meeting.create({
      title,
      host: req.user._id,
      meetingCode,
      status: 'active'
    });

    res.status(201).json({
      message: 'Meeting room created successfully',
      meeting
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
