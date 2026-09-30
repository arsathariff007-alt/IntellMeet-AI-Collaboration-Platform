const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a meeting title'],
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'scheduled'
  },
  meetingCode: {
    type: String,
    required: true,
    unique: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
});

module.exports = mongoose.model('Meeting', MeetingSchema);
