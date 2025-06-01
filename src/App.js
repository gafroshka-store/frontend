import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CreateAnnouncementPage from './pages/Announcement/CreateAnnouncementPage';
import AnnouncementPage from './pages/Announcement/AnnouncementPage';
import EditAnnouncementPage from './pages/Announcement/EditAnnouncementPage';
import SearchPage from './pages/SearchPage/SearchPage';
import MyAnnouncementsPage from './pages/Announcement/MyAnnouncementsPage';
import UserProfilePage from './pages/UserProfilePage';

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('jwt');
  return token ? children : <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/announcement/create" element={<CreateAnnouncementPage />} />
          <Route path="/announcement/:id" element={<AnnouncementPage />} />
          <Route path="/announcement/:id/edit" element={<EditAnnouncementPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/my-announcements"
            element={
              <PrivateRoute>
                <MyAnnouncementsPage />
              </PrivateRoute>
            }
          />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}