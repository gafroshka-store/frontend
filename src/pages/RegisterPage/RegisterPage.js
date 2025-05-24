import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    day_of_birth: '',
    sex: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // базовый набор полей
      const payload = {
        email: form.email,
        password: form.password,
        name: form.name,
        phone_number: form.phone_number,
      };

      // дописываем необязательные
      if (form.surname.trim()) {
        payload.surname = form.surname.trim();
      }
      if (form.day_of_birth.trim()) {
        // именно key date_of_birth, как ожидает Go
        payload.date_of_birth = new Date(form.day_of_birth).toISOString();
      }
      if (form.sex === 'male') {
        payload.sex = true;
      } else if (form.sex === 'female') {
        payload.sex = false;
      }

      const { token } = await apiRegister(payload);
      login(token);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Регистрация</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder="Пароль *"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder="Имя *"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            name="surname"
            placeholder="Фамилия (необязательно)"
            value={form.surname}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <input
            type="date"
            name="day_of_birth"
            placeholder="Дата рождения (необязательно)"
            value={form.day_of_birth}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <select name="sex" value={form.sex} onChange={handleChange}>
            <option value="">Пол (необязательно)</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <div className="input-group">
          <input
            type="text"
            name="phone_number"
            placeholder="Телефон *"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
          Поля, отмеченные <b>*</b>, обязательны. Остальные — необязательны.
        </div>
        <button type="submit" className="register-button">
          Зарегистрироваться
        </button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  );
}
