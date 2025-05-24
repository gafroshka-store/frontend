import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

function getInitials(name, surname) {
  if (!name && !surname) return '👤';
  return (
    (name ? name[0] : '') +
    (surname ? surname[0] : '')
  ).toUpperCase();
}

export default function ProfilePage() {
  const { token, userId, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          surname: res.data.surname || '',
          email: res.data.email || '',
          phone_number: res.data.phone_number || '',
        });
      })
      .catch(err => {
        setError('Ошибка загрузки профиля');
      });
  }, [userId, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const patchData = {};
      if (form.name !== user.name) patchData.name = form.name;
      if (form.surname !== user.surname) patchData.surname = form.surname;
      if (form.email !== user.email) patchData.email = form.email;
      if (form.phone_number !== user.phone_number) patchData.phone_number = form.phone_number;

      await axios.put(
        `/api/user/${userId}`,
        patchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setEdit(false);
      setSuccess('Данные успешно обновлены');
    } catch (err) {
      setError('Ошибка обновления профиля');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <div style={{ padding: 32 }}>Загрузка...</div>;

  const handleCreateAnnouncement = () => {
    navigate('/announcement/create');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Логотип и бренд удалены */}
        {/* Аватар */}
        <div>
          <div className="profile-avatar" style={{
            background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: 0
          }}>
            {getInitials(user.name, user.surname)}
          </div>
        </div>
        <h2 className="profile-title">{user.name} {user.surname}</h2>
        <div className="profile-subtitle">{user.email}</div>
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={handleCreateAnnouncement} className="profile-create-announcement-btn">
            Создать товар
          </button>
        </div>
        {!edit ? (
          <ul className="profile-info-list">
            <li>
              <span className="profile-info-label">Телефон:</span>
              <span className="profile-info-value">{user.phone_number}</span>
            </li>
            <li>
              <span className="profile-info-label">Дата рождения:</span>
              <span className="profile-info-value">
                {user.day_of_birth && !user.day_of_birth.startsWith('0001-01-01')
                  ? user.day_of_birth.slice(0, 10)
                  : ''}
              </span>
            </li>
            <li>
              <span className="profile-info-label">Пол:</span>
              <span className="profile-info-value">
                {user.sex === true ? 'Мужской' : user.sex === false ? 'Женский' : ''}
              </span>
            </li>
            <li>
              <span className="profile-info-label">Дата регистрации:</span>
              <span className="profile-info-value">
                {user.registration_date && user.registration_date.slice(0, 10)}
              </span>
            </li>
            <li>
              <span className="profile-info-label">Баланс:</span>
              <span className="profile-info-value">{user.balance}</span>
            </li>
            <li>
              <span className="profile-info-label">Сделок:</span>
              <span className="profile-info-value">{user.deals_count}</span>
            </li>
            <li>
              <span className="profile-info-label">Рейтинг:</span>
              <span className="profile-info-value">
                {user.rating} <span style={{ color: '#f6c700' }}>★</span> ({user.rating_count})
              </span>
            </li>
          </ul>
        ) : (
          <form onSubmit={handleSave} className="profile-form">
            <div>
              <label>
                Имя:
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
            </div>
            <div>
              <label>
                Фамилия:
                <input name="surname" value={form.surname} onChange={handleChange} />
              </label>
            </div>
            <div>
              <label>
                Email:
                <input name="email" value={form.email} onChange={handleChange} required />
              </label>
            </div>
            <div>
              <label>
                Телефон:
                <input name="phone_number" value={form.phone_number} onChange={handleChange} required />
              </label>
            </div>
            <div className="profile-actions">
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setEdit(false)} style={{ background: '#bdbdbd' }}>Отмена</button>
            </div>
          </form>
        )}
        {!edit && (
          <div className="profile-actions">
            <button onClick={() => setEdit(true)}>Редактировать</button>
            <button onClick={handleLogout} style={{ background: '#e53e3e' }}>Выйти</button>
          </div>
        )}
      </div>
    </div>
  );
}
