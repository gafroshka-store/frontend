import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateAnnouncementPage from './pages/Announcement/CreateAnnouncementPage';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/announcement/create"
        element={
          <PrivateRoute>
            <CreateAnnouncementPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}