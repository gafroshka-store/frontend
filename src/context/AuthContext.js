import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Ваша parseJwt остаётся без изменений
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

/**
 * AuthProvider, который:
 * - Хранит токен в state
 * - Подхватывает изменения sessionStorage из любых вкладок
 * - Обновляет userId при любом изменении токена
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('jwt'));
  const [userId, setUserId] = useState(() => {
    const t = sessionStorage.getItem('jwt');
    return t ? parseJwt(t).id : null;
  });

  // Обновляем userId при изменении token
  useEffect(() => {
    if (token) {
      setUserId(parseJwt(token).id || null);
    } else {
      setUserId(null);
    }
  }, [token]);

  // Слушаем событие storage на случай изменений в других вкладках
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'jwt') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Обёрнутые login/logout, чтобы всегда идти через React state
  const login = useCallback((newToken) => {
    sessionStorage.setItem('jwt', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('jwt');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук остаётся прежним
export const useAuth = () => useContext(AuthContext);
