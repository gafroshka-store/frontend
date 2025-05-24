import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/announcements/top/10')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Топ-10 товаров:', data);
        setAnnouncements(data);
      })
      .catch(err => {
        setError('Ошибка загрузки товаров');
        console.error('Ошибка загрузки топ-10 товаров:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  console.log('Render, announcements:', announcements);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button
          className="dashboard-profile-btn"
          onClick={() => navigate('/profile')}
        >
          Профиль
        </button>
      </div>

      <h1 className="dashboard-title">Топ-10 товаров</h1>

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
          </div>
        ))}
      </div>
    </div>
  );
}
