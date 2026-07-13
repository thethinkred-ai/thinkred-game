import { createContext, useContext, useEffect, useState } from 'react';
import { StepikUser } from '../../../shared/types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: StepikUser | null;
  loading: boolean;
  login: () => void;
  devLogin: () => void;
  logout: () => void;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenValue: string) => {
    try {
      const data = await apiService.verifyToken();
      setUser(data.user);
      setToken(tokenValue);
    } catch {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/stepik/callback`);
    window.location.href = `/auth/stepik?redirect_uri=${redirectUri}`;
  };

  const devLogin = () => {
    window.location.href = `/auth/dev-login`;
  };

  const logout = async () => {
    try {
      if (token) {
        await apiService.logout();
      }
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    devLogin,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
