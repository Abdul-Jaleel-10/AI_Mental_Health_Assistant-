const mongoose = require('mongoose');

const wellnessCheckSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true
  },
  recommendations: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
wellnessCheckSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('WellnessCheck', wellnessCheckSchema); 