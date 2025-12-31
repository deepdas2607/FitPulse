import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardHealth from './pages/DashboardHealth';
import DashboardFitness from './pages/DashboardFitness';
import ProfileSettings from './pages/ProfileSettings';
import DisPred from './components/Disspredd';
import Chatbot from './pages/Chatbot';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Enforce authentication
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard/health"
        element={
          <ProtectedRoute>
            <DashboardHealth />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/fitness"
        element={
          <ProtectedRoute>
            <DashboardFitness />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/disease-predictor"
        element={
          <ProtectedRoute>
            <DisPred />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/chat"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;