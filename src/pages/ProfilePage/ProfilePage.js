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
  const [balance, setBalance] = useState(null);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupError, setTopupError] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
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

  // Получение баланса
  const fetchBalance = async () => {
    try {
      const res = await axios.get(`/api/user/${userId}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(res.data.balance);
    } catch (err) {
      setBalance(null);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchBalance();
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

  // Пополнение баланса
  const handleTopup = async (e) => {
    e.preventDefault();
    setTopupError('');
    setTopupLoading(true);
    try {
      const amount = parseInt(topupAmount, 10);
      if (!amount || amount <= 0) {
        setTopupError('Введите сумму больше 0');
        setTopupLoading(false);
        return;
      }
      await axios.post(
        `/api/user/${userId}/balance/topup`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTopup(false);
      setTopupAmount('');
      fetchBalance();
      // обновить user, если нужно
      const res = await axios.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setSuccess('Баланс успешно пополнен');
    } catch (err) {
      setTopupError('Ошибка пополнения баланса');
    } finally {
      setTopupLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!token) {
    return (
      <div style={{ padding: 32, color: '#e53e3e' }}>
        Только авторизованные пользователи могут просматривать профиль.
      </div>
    );
  }

  if (!user) return <div style={{ padding: 32 }}>Загрузка...</div>;

  const handleCreateAnnouncement = () => {
    navigate('/announcement/create');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="profile-to-dashboard-btn"
            style={{
              background: '#43cea2',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1.2rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '1rem',
              height: '40px',
              minWidth: 'auto'
            }}
          >
            К списку товаров
          </button>
          <button
            onClick={handleCreateAnnouncement}
            className="profile-create-announcement-btn"
            style={{
              fontSize: '1rem',
              height: '40px',
              minWidth: 'auto'
            }}
          >
            Создать товар
          </button>
        </div>
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
              <span className="profile-info-value">
                {balance !== null ? balance : user.balance}
                <button
                  style={{
                    marginLeft: 12,
                    background: '#43cea2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.2rem 0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                  onClick={() => setShowTopup(true)}
                  type="button"
                >
                  Пополнить
                </button>
              </span>
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
        {/* Модальное окно/форма пополнения баланса */}
        {showTopup && (
          <div style={{
            position: 'fixed',
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}>
            <form
              onSubmit={handleTopup}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                minWidth: 280,
                boxShadow: '0 4px 24px rgba(67,206,162,0.13)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Пополнить баланс</div>
              <input
                type="number"
                min="1"
                step="1"
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                placeholder="Сумма"
                style={{ fontSize: 16, borderRadius: 6, border: '1px solid #e2e8f0', padding: 8 }}
                required
              />
              {topupError && <div style={{ color: '#e53e3e', fontSize: 15 }}>{topupError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={topupLoading}
                  style={{ background: '#43cea2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}
                >
                  {topupLoading ? 'Пополнение...' : 'Пополнить'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowTopup(false); setTopupError(''); setTopupAmount(''); }}
                  style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
