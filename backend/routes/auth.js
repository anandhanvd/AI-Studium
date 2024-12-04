const express = require('express');
const router = express.Router();
const { signup, login, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { signupValidation, loginValidation, validate } = require('../middleware/validator');

// Register user
router.post('/signup', signupValidation, validate, signup);

// Login user
router.post('/login', loginValidation, validate, login);

// Get current user
router.get('/me', auth, getCurrentUser);

// Protected route example
router.get('/teacher-only', auth, roleCheck(['teacher']), (req, res) => {
    res.json({ message: 'Teacher access granted' });
});

module.exports = router;