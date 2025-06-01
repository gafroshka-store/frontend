import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const categoryMap = {
  1: 'Электроника',
  2: 'Одежда',
  3: 'Дом и сад',
  4: 'Детские товары',
  5: 'Авто',
  6: 'Спорт',
  7: 'Другое'
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const navigate = useNavigate();
  const query = useQuery().get('q') || '';
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Получить корзину для проверки наличия товара
  const fetchCart = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`/api/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    if (!query) return;
    setError('');
    setLoading(true);
    console.log('[SearchPage] GET /api/announcements/search?q=' + encodeURIComponent(query));
    fetch(`/api/announcements/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(err => {
        setError('Ошибка поиска');
        console.error('[SearchPage] Ошибка поиска:', err);
      })
      .finally(() => setLoading(false));
  }, [query]);

  // Добавить в корзину
  const handleAddToCart = async (annId) => {
    if (!userId) return;
    try {
      await axios.post(`/api/cart/${userId}/item/${annId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch {
      alert('Ошибка добавления в корзину');
    }
  };

  // Проверка: находится ли товар в корзине
  const isInCart = (annId) => cartItems.some(item => item.id === annId);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="dashboard-profile-btn" onClick={() => navigate('/profile')}>Профиль</button>
        <button className="dashboard-create-btn" onClick={() => navigate('/announcement/create')}>+ Новый товар</button>
        <button className="dashboard-profile-btn" onClick={() => navigate('/dashboard')}>Топ-10</button>
        <button className="dashboard-profile-btn" onClick={() => navigate(-1)}>Назад</button>
      </div>
      <h1 className="dashboard-title">Результаты поиска</h1>
      <div style={{ textAlign: 'center', marginBottom: 24, color: '#185a9d', fontSize: 18 }}>
        {query && <>По запросу: <b>{query}</b></>}
      </div>
      {loading && <div className="dashboard-loading">Пожалуйста, ожидайте...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      <div className="dashboard-list">
        {results.map(a => {
          const hasDiscount = a.discount > 0;
          const discountedPrice = hasDiscount
            ? Math.round(a.price * (1 - a.discount / 100))
            : a.price;
          const inCart = isInCart(a.id);
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
                <button
                  className="dashboard-profile-btn"
                  style={{
                    background: inCart ? '#e53e3e' : '#43cea2',
                    cursor: inCart ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (!inCart) handleAddToCart(a.id);
                  }}
                  title={inCart ? 'Уже в корзине' : 'Добавить в корзину'}
                  disabled={inCart}
                >
                  🛒
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
