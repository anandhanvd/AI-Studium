import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

function PrivateRoute({ children, role }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token }
        });

        setUserRole(response.data.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && role !== userRole) {
    return <Navigate to={`/${userRole}-dashboard`} />;
  }

  return children;
}

export default PrivateRoute;