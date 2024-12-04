import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import axios from 'axios';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [stage, setStage] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [conversationData, setConversationData] = useState({
    subject: '',
    level: '',
    topic: ''
  });
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        setUserData(userRes.data);

        setMessages([{
          content: `Hi ${userRes.data.name}! What would you like to study today?`,
          sender: 'bot'
        }]);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (currentQuestionIndex !== null && quiz) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionIndex]: new Date().getTime()
      }));
    }
  }, [currentQuestionIndex, quiz]);

  const handleSend = async () => {
    if (!currentMessage.trim()) return;

    const newMessages = [...messages, { content: currentMessage, sender: 'user' }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (stage === 'welcome') {
        setConversationData({ ...conversationData, subject: currentMessage });
        setMessages([...newMessages, {
          content: `What's your level in ${currentMessage}? (Beginner/Intermediate/Advanced)`,
          sender: 'bot'
        }]);
        setStage('level');
      } else if (stage === 'level') {
        const level = currentMessage.toLowerCase();
        if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
          setMessages([...newMessages, {
            content: 'Please specify either Beginner, Intermediate, or Advanced.',
            sender: 'bot'
          }]);
        } else {
          setConversationData({ ...conversationData, level: currentMessage });
          setMessages([...newMessages, {
            content: 'Which specific topic would you like to focus on?',
            sender: 'bot'
          }]);
          setStage('topic');
        }
      } else if (stage === 'topic') {
        setConversationData({ ...conversationData, topic: currentMessage });
        setLoading(true);

        try {
          const token = localStorage.getItem('token');
          const quizResponse = await axios.post(
            'http://localhost:5000/api/quiz/generate',
            {
              subject: conversationData.subject,
              level: conversationData.level,
              topic: currentMessage
            },
            { headers: { 'x-auth-token': token } }
          );

          if (quizResponse.data) {
            setQuiz(quizResponse.data);
            setQuizStartTime(new Date());
            setMessages([...newMessages, {
              content: "Great! I've prepared a quiz to assess your knowledge. Ready to begin?",
              sender: 'bot'
            }]);
            setStage('quiz');
          } else {
            throw new Error('No quiz data received');
          }
        } catch (error) {
          console.error('Error generating quiz:', error);
          setMessages([...newMessages, {
            content: 'Sorry, there was an error generating the quiz. Please try again.',
            sender: 'bot'
          }]);
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages([...newMessages, {
        content: 'Sorry, there was an error. Please try again.',
        sender: 'bot'
      }]);
    }

    setCurrentMessage('');
    setLoading(false);
  };

  const handleAnswerSelect = (index) => {
    const endTime = new Date().getTime();
    const startTime = questionStartTimes[currentQuestionIndex];
    
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestionIndex]: endTime - startTime
    }));

    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: index
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const endTime = new Date().getTime();
      
      // Calculate time for last question if not already recorded
      if (!questionTimes[currentQuestionIndex]) {
        const startTime = questionStartTimes[currentQuestionIndex];
        setQuestionTimes(prev => ({
          ...prev,
          [currentQuestionIndex]: endTime - startTime
        }));
      }

      const response = await axios.post(
        'http://localhost:5000/api/quiz/submit',
        {
          quizId: quiz.id,
          answers,
          startTime: quizStartTime.getTime(),
          endTime,
          questionTimes
        },
        { headers: { 'x-auth-token': token } }
      );

      setQuizResults(response.data);
      setQuizSubmitted(true);
      setStage('results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const renderQuiz = () => {
    if (!quiz || !quiz.questions) return null;

    const question = quiz.questions[currentQuestionIndex];
    const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

    return (
      <Box sx={{ mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
          {question.question}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[currentQuestionIndex] === index ? "contained" : "outlined"}
              onClick={() => handleAnswerSelect(index)}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 1.5,
                px: 2
              }}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleQuizSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const renderResults = () => {
    if (!quizResults) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="body1" gutterBottom>
          Score: {quizResults.score} out of {quizResults.totalQuestions * 2}
        </Typography>
        {quizResults.mlData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average Time: {quizResults.mlData.timeTakenPerQuestion.toFixed(2)} minutes/question
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Question Difficulty: {quizResults.mlData.questionDifficulty.toFixed(1)}/10
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Topic Difficulty: {quizResults.mlData.topicDifficulty.toFixed(1)}/10
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Performance Level: {quizResults.mlData.skillLevel}
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setStage('welcome');
            setQuiz(null);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setQuizSubmitted(false);
            setQuizResults(null);
            setQuestionTimes({});
            setQuestionStartTimes({});
          }}
          sx={{ mt: 2 }}
        >
          Start New Quiz
        </Button>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {stage === 'results' ? renderResults() : (
          quiz ? renderQuiz() : (
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index} sx={{ 
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1 
                }}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
                      maxWidth: '80%' 
                    }}
                  >
                    <Typography>{msg.content}</Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          )
        )}
      </Box>
      {!quiz && stage !== 'results' && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Button variant="contained" onClick={handleSend}>
              Send
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default ChatInterface;