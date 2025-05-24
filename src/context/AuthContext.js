import { createContext, useContext, useState } from 'react';

// Вспомогательная функция для декодирования JWT
function parseJwt(token) {
  if (!token) return {};
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('jwt'));
  const [userId, setUserId] = useState(() => {
    const t = sessionStorage.getItem('jwt');
    return t ? parseJwt(t).id : null;
  });

  const login = (newToken) => {
    sessionStorage.setItem('jwt', newToken);
    setToken(newToken);
    const payload = parseJwt(newToken);
    setUserId(payload.id || null);
  };

  const logout = () => {
    sessionStorage.removeItem('jwt');
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);