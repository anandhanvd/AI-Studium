const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const quizController = require('../controllers/quizController');

// Quiz generation route
router.post('/generate', auth, quizController.generateQuiz);

// Quiz submission route
router.post('/submit', auth, quizController.submitQuiz);


// Get specific quiz results
router.get('/:quizId', auth, quizController.getQuizResults);
// Get quiz history route
router.get('/history', auth, quizController.getQuizHistory);

module.exports = router;