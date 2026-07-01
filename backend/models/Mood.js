const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'neutral', 'sad', 'anxious', 'angry', 'tired', 'stressed']
  },
  intensity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
moodSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Mood', moodSchema); 