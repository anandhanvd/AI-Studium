const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Send message
router.post('/send', auth, sendMessage);

// Get chat history
router.get('/history', auth, getChatHistory);

module.exports = router;