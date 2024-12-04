const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  }
});

const attemptSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userAnswer: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const analyticsSchema = new mongoose.Schema({
  timeTakenPerQuestion: {
    type: Number,
    required: true
  },
  questionDifficulty: {
    type: Number,
    required: true
  },
  topicDifficulty: {
    type: Number,
    required: true
  },
  scorePercentage: {
    type: Number,
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  attempts: [attemptSchema],
  analytics: analyticsSchema,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  score: {
    type: Number
  }
});

module.exports = mongoose.model('Quiz', quizSchema);