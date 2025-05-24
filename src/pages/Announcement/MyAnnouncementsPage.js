import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Dashboard.css';

export default function MyAnnouncementsPage() {
  const { userId, token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMine = () => {
    setLoading(true);
    console.log('[MyAnnouncementsPage] GET /api/announcement/user/' + userId);
    axios.get(`/api/announcement/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('[MyAnnouncementsPage] Response:', res);
        setAnnouncements(res.data);
      })
      .catch(err => {
        setError('Ошибка загрузки ваших товаров');
        console.error('[MyAnnouncementsPage] Ошибка загрузки:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот товар?')) return;
    try {
      console.log('[MyAnnouncementsPage] DELETE /api/announcement/' + id);
      await axios.delete(`/api/announcement/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(anns => anns.filter(a => a.id !== id));
      console.log('[MyAnnouncementsPage] Удалено:', id);
    } catch (err) {
      alert('Ошибка удаления');
      console.error('[MyAnnouncementsPage] Ошибка удаления:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="dashboard-create-btn" onClick={() => navigate('/announcement/create')}>+ Новый товар</button>
        <button className="dashboard-profile-btn" onClick={() => navigate('/profile')}>Профиль</button>
        <button className="dashboard-profile-btn" onClick={() => navigate('/dashboard')}>Топ-10</button>
      </div>
      <h1 className="dashboard-title">Мои товары</h1>
      {loading && <div className="dashboard-loading">Загрузка...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      <div className="dashboard-list">
        {announcements.map(a => (
          <div className="dashboard-card" key={a.id}>
            <div className="dashboard-card-header">
              <span className="dashboard-card-title">{a.name}</span>
              <span className="dashboard-card-price">{a.price} ₽</span>
            </div>
            <div className="dashboard-card-desc">{a.description}</div>
            <div className="dashboard-card-meta">
              <span>Категория: {a.category}</span>
              <span>Скидка: {a.discount}%</span>
            </div>
            <div className="dashboard-card-meta">
              <span>Рейтинг: {a.rating} ★</span>
              <span>Оценок: {a.rating_count}</span>
            </div>
            <div className="dashboard-card-date">
              Добавлено: {a.created_at ? a.created_at.slice(0, 10) : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="dashboard-create-btn"
                style={{ background: '#667eea' }}
                onClick={() => navigate(`/announcement/${a.id}/edit`)}
              >
                Редактировать
              </button>
              <button
                className="dashboard-profile-btn"
                style={{ background: '#e53e3e' }}
                onClick={() => handleDelete(a.id)}
              >
                Удалить
              </button>
              <button
                className="dashboard-profile-btn"
                style={{ background: '#43cea2' }}
                onClick={() => navigate(`/announcement/${a.id}`)}
              >
                Отзывы
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
