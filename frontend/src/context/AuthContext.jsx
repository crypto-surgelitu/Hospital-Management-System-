import { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

function getInitialState() {
  const storedToken = localStorage.getItem('hms_token');
  if (storedToken) {
    try {
      const decoded = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem('hms_token');
        return { token: null, user: null };
      }
      return { token: storedToken, user: decoded };
    } catch {
      localStorage.removeItem('hms_token');
      return { token: null, user: null };
    }
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getInitialState().user);
  const [token, setToken] = useState(() => getInitialState().token);

  const login = (userData, authToken) => {
    localStorage.setItem('hms_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}