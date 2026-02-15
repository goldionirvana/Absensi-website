
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import GuruDashboard from './pages/GuruDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { User, Role } from './types';

// Komponen Pembungkus untuk Keamanan Route
const ProtectedRoute = ({ 
  children, 
  user, 
  requiredRole 
}: { 
  children: React.ReactElement, 
  user: User | null, 
  requiredRole: Role 
}) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole) {
    // Redirect ke dashboard masing-masing jika salah role
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }
  return children;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to={`/${currentUser.role.toLowerCase()}`} replace /> : <Login onLogin={login} />
        } />

        <Route path="/register" element={
          currentUser ? <Navigate to={`/${currentUser.role.toLowerCase()}`} replace /> : <Register onRegister={login} />
        } />
        
        {/* Protected Routes dengan Validasi Role Berjenjang */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute user={currentUser} requiredRole={Role.ADMIN}>
              <SuperAdminDashboard user={currentUser!} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/guru/*" 
          element={
            <ProtectedRoute user={currentUser} requiredRole={Role.GURU}>
              <GuruDashboard user={currentUser!} onLogout={logout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute user={currentUser} requiredRole={Role.STUDENT}>
              <StudentDashboard user={currentUser!} onLogout={logout} />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
