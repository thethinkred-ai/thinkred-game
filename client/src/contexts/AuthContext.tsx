import { createContext, useContext, useEffect, useState } from 'react';
import { StepikUser } from '../../../shared/types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: StepikUser | null;
  loading: boolean;
  login: () => void;
  devLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<StepikUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const data = await apiService.verifyToken();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/stepik';
  };

  const devLogin = () => {
    window.location.href = '/api/auth/dev-login';
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    devLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
