import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Dashboard } from './components/Dashboard';
import { EnterpriseManager } from './components/EnterpriseManager';
import { EventPanel } from './components/EventPanel';
import { EconomicIndicators } from './components/EconomicIndicators';
import { ProgressPanel } from './components/ProgressPanel';
import { EnterpriseMap } from './components/EnterpriseMap';
import { AchievementsPage } from './components/AchievementsPage';

const GameMap = lazy(() => import('./components/GameMap').then((m) => ({ default: m.GameMap })));

function MapRouteFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="loading-spinner" />
      <span className="ml-3 text-slate-400">Загрузка карты...</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="loading-spinner" /></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthCallback() {
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<ProtectedRoute><GameProvider><Layout /></GameProvider></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="enterprises" element={<EnterpriseManager />} />
        <Route path="enterprise-map" element={<EnterpriseMap />} />
        <Route path="events" element={<EventPanel />} />
        <Route path="economy" element={<EconomicIndicators />} />
        <Route path="progress" element={<ProgressPanel />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="map" element={<Suspense fallback={<MapRouteFallback />}><GameMap /></Suspense>} />
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
