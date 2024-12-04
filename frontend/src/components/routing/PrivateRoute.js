import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const PrivateRoute = ({ children, role }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        setIsAuthorized(res.data.role === role);
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    verifyUser();
  }, [token, role]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default PrivateRoute;