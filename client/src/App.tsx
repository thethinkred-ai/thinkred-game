import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { EnterpriseManager } from './components/EnterpriseManager';
import { EventPanel } from './components/EventPanel';
import { EconomicIndicators } from './components/EconomicIndicators';
import { ProgressPanel } from './components/ProgressPanel';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="loading-spinner" /></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthCallback() {
  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    window.location.replace('/');
    return null;
  }
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/callback" element={<AuthCallback />} />
      <Route path="/" element={<ProtectedRoute><GameProvider><Layout /></GameProvider></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="enterprises" element={<EnterpriseManager />} />
        <Route path="events" element={<EventPanel />} />
        <Route path="economy" element={<EconomicIndicators />} />
        <Route path="progress" element={<ProgressPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
