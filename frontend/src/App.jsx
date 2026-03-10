import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import UserProfilePage from './pages/dashboard/UserProfilePage';
import CompanionDashboard from './pages/dashboard/CompanionDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import FindCompanionPage from './pages/FindCompanionPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-companion" element={<FindCompanionPage />} />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={['nri', 'admin']}>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/companion"
              element={
                <ProtectedRoute allowedRoles={['companion', 'admin']}>
                  <CompanionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute allowedRoles={['nri', 'companion', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;