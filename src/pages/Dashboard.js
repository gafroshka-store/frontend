import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const categoryMap = {
  1: 'Электроника',
  2: 'Одежда',
  3: 'Дом и сад',
  4: 'Детские товары',
  5: 'Авто',
  6: 'Спорт',
  7: 'Другое'
};

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchTop = () => {
    setLoading(true);
    console.log('[Dashboard] POST /api/announcements/top {limit: 20}');
    fetch('/api/announcements/top', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit: 20 })
    })
      .then(res => {
        console.log('[Dashboard] Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('[Dashboard] Data:', data);
        setAnnouncements(data);
      })
      .catch(err => {
        setError('Ошибка загрузки товаров');
        console.error('[Dashboard] Ошибка загрузки топ-товаров:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTop();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <form onSubmit={handleSearchSubmit} className="dashboard-search-form">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            className="dashboard-search-input"
          />
          <button type="submit" className="dashboard-search-btn">🔍</button>
        </form>
        <button
          className="dashboard-create-btn"
          onClick={() => navigate('/announcement/create')}
        >
          + Новый товар
        </button>
        <button
          className="dashboard-refresh-btn"
          onClick={fetchTop}
          title="Обновить список"
        >
          ⟳
        </button>
        <button
          className="dashboard-profile-btn"
          onClick={() => navigate('/profile')}
        >
          Профиль
        </button>
      </div>

      <h1 className="dashboard-title">Топ-10 товаров</h1>

      {loading && <div className="dashboard-loading">Пожалуйста, ожидайте...</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-list">
        {Array.isArray(announcements) && announcements.length > 0 ? (
          announcements.map(a => {
            const hasDiscount = a.discount > 0;
            const discountedPrice = hasDiscount
              ? Math.round(a.price * (1 - a.discount / 100))
              : a.price;
            return (
              <div className="dashboard-card" key={a.id}>
                <div className="dashboard-card-header">
                  <span className="dashboard-card-title">{a.name}</span>
                  <span className="dashboard-card-price">
                    {hasDiscount ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                          {a.price} ₽
                        </span>
                        <span style={{ color: '#43cea2', fontWeight: 700 }}>
                          {discountedPrice} ₽
                        </span>
                      </>
                    ) : (
                      <span>{a.price} ₽</span>
                    )}
                  </span>
                </div>
                <div className="dashboard-card-desc">{a.description}</div>
                <div className="dashboard-card-meta">
                  <span>Категория: {categoryMap[a.category] || a.category}</span>
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
                    className="dashboard-profile-btn"
                    style={{ background: '#667eea' }}
                    onClick={() => navigate(`/announcement/${a.id}`)}
                  >
                    Отзывы
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 32, color: '#888', textAlign: 'center' }}>
            Нет товаров
          </div>
        )}
      </div>
    </div>
  );
}
