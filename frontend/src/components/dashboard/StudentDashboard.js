import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';
import ChatInterface from '../chat/ChatInterface';
import API_BASE_URL from '../../config/api';

function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'x-auth-token': token }
        };

        // Fetch user data
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/me`, config);
        setUserData(userRes.data);

        // You can add more API calls here for courses and assignments
        // For now, using dummy data
        setCourses([
          { id: 1, name: 'Mathematics 101', progress: 60 },
          { id: 2, name: 'Physics Basics', progress: 45 },
          { id: 3, name: 'Introduction to Programming', progress: 75 }
        ]);

        setAssignments([
          { id: 1, title: 'Math Homework 1', dueDate: '2024-02-20', status: 'Pending' },
          { id: 2, title: 'Physics Quiz', dueDate: '2024-02-22', status: 'Completed' },
          { id: 3, title: 'Programming Project', dueDate: '2024-02-25', status: 'In Progress' }
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userData?.name}!
        </Typography>

        <Grid container spacing={3}>
          {/* Enrolled Courses */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Courses
              </Typography>
              {courses.map((course) => (
                <Card key={course.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{course.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {course.progress}%
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Course</Button>
                    <Button size="small">Continue Learning</Button>
                  </CardActions>
                </Card>
              ))}
            </Paper>
          </Grid>

          {/* Upcoming Assignments */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Assignments
              </Typography>
              <List>
                {assignments.map((assignment) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`Due: ${assignment.dueDate} | Status: ${assignment.status}`}
                      />
                      <Button size="small" color="primary">
                        View
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Chat Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Study Assistant
              </Typography>
              <ChatInterface />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default StudentDashboard;