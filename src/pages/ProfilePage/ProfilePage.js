import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

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
          // day_of_birth не включаем в форму для редактирования
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
      // day_of_birth не отправляем

      await axios.put(
        `/api/user/${userId}`,
        patchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Получить обновлённые данные
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
        <h2 className="profile-title">Профиль пользователя</h2>
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={handleCreateAnnouncement} className="profile-create-announcement-btn">
            Создать товар
          </button>
        </div>
        {!edit ? (
          <>
            <div><b>Имя:</b> {user.name}</div>
            <div><b>Фамилия:</b> {user.surname}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Телефон:</b> {user.phone_number}</div>
            <div>
              <b>Дата рождения:</b>{' '}
              {user.day_of_birth && !user.day_of_birth.startsWith('0001-01-01')
                ? user.day_of_birth.slice(0, 10)
                : ''}
            </div>
            <div><b>Пол:</b> {user.sex === true ? 'Мужской' : user.sex === false ? 'Женский' : ''}</div>
            <div><b>Дата регистрации:</b> {user.registration_date && user.registration_date.slice(0, 10)}</div>
            <div><b>Баланс:</b> {user.balance}</div>
            <div><b>Сделок:</b> {user.deals_count}</div>
            <div><b>Рейтинг:</b> {user.rating} ({user.rating_count})</div>
            <div className="profile-actions">
              <button onClick={() => setEdit(true)}>Редактировать</button>
              <button onClick={handleLogout} style={{ marginLeft: 10 }}>Выйти</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="profile-form">
            <div>
              <label>Имя: <input name="name" value={form.name} onChange={handleChange} required /></label>
            </div>
            <div>
              <label>Фамилия: <input name="surname" value={form.surname} onChange={handleChange} /></label>
            </div>
            <div>
              <label>Email: <input name="email" value={form.email} onChange={handleChange} required /></label>
            </div>
            <div>
              <label>Телефон: <input name="phone_number" value={form.phone_number} onChange={handleChange} required /></label>
            </div>
            {/* day_of_birth не редактируется */}
            <div className="profile-actions">
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setEdit(false)} style={{ marginLeft: 10 }}>Отмена</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
