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
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function TeacherDashboard() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'x-auth-token': token }
        };

        // Fetch user data
        const userRes = await axios.get('http://localhost:5000/api/auth/me', config);
        setUserData(userRes.data);

        // Dummy data for courses and students
        setCourses([
          { id: 1, name: 'Mathematics 101', students: 25, status: 'Active' },
          { id: 2, name: 'Physics Basics', students: 30, status: 'Active' },
          { id: 3, name: 'Programming Fundamentals', students: 20, status: 'Draft' }
        ]);

        setStudents([
          { id: 1, name: 'John Doe', course: 'Mathematics 101', progress: 75 },
          { id: 2, name: 'Jane Smith', course: 'Physics Basics', progress: 60 },
          { id: 3, name: 'Mike Johnson', course: 'Programming Fundamentals', progress: 90 }
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
          {/* Courses Management */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  My Courses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Add Course
                </Button>
              </Box>
              {courses.map((course) => (
                <Card key={course.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{course.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students: {course.students} | Status: {course.status}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Details</Button>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Paper>
          </Grid>

          {/* Student Progress */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Student Progress
              </Typography>
              <List>
                {students.map((student) => (
                  <React.Fragment key={student.id}>
                    <ListItem>
                      <ListItemText
                        primary={student.name}
                        secondary={`Course: ${student.course} | Progress: ${student.progress}%`}
                      />
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Analytics Section */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Course Analytics
              </Typography>
              {/* Add analytics components here */}
              <Typography variant="body1" color="text.secondary">
                Analytics dashboard will be implemented here
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default TeacherDashboard;