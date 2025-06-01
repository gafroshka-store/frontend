import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';
import logo from '../../assets/gafroshka-logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await apiLogin(email, password);
      login(token);
      navigate('/dashboard'); // изменено с /profile на /dashboard
    } catch (err) {
      setError(err);
      console.error('LoginPage error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-logo-container">
          <img
            src={logo}
            alt="Gafroshka Store"
            className="login-logo"
          />
        </div>
        <div className="login-brand-title">GAFROSHKA-STORE</div>
        <h2>Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Войти
        </button>
        <button
          type="button"
          className="login-button"
          style={{ background: '#43cea2', marginTop: 8 }}
          onClick={() => navigate('/dashboard')}
        >
          Войти как гость
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
}
