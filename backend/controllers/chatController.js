const Chat = require('../models/Chat');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Find or create chat session
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId });
    }

    // Add user message
    chat.messages.push({
      content: message,
      sender: 'user'
    });

    // Generate context-aware response based on conversation stage
    const messageCount = chat.messages.length;
    let prompt = '';

    if (messageCount === 1) {
      prompt = `As a helpful educational assistant, ask about the student's knowledge level (Beginner/Intermediate/Advanced) for studying: ${message}`;
    } else if (messageCount === 2) {
      prompt = `Based on their ${message} level, ask about specific areas they want to focus on in their studies.`;
    } else {
      prompt = `Acknowledge their focus area and let them know you'll generate a quiz to assess their knowledge in: ${message}`;
    }

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const botResponse = completion.data.choices[0].text.trim();

    // Add bot response
    chat.messages.push({
      content: botResponse,
      sender: 'bot'
    });

    await chat.save();

    res.json({
      success: true,
      message: botResponse,
      chatHistory: chat.messages
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Error processing chat message' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await Chat.findOne({ userId }).sort({ 'messages.timestamp': -1 });
    
    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};