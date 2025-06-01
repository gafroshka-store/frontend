import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
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

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [selectedToBuy, setSelectedToBuy] = useState([]);
  const navigate = useNavigate();
  const { userId, token } = useAuth();

  const fetchTop = () => {
    setLoading(true);
    // userId теперь обязателен
    fetch('/api/announcements/top', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, limit: 30 })
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

  // Получить корзину
  const fetchCart = async () => {
    if (!userId) return;
    setCartLoading(true);
    setCartError('');
    try {
      const res = await axios.get(`/api/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCartError('Ошибка загрузки корзины');
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Открытие корзины
  const handleOpenCart = () => {
    setCartOpen(true);
    fetchCart();
  };

  // Добавить в корзину
  const handleAddToCart = async (annId) => {
    if (!userId) return;
    try {
      await axios.post(`/api/cart/${userId}/item/${annId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      alert('Ошибка добавления в корзину');
    }
  };

  // Удалить из корзины
  const handleRemoveFromCart = async (annId) => {
    if (!userId) return;
    try {
      await axios.delete(`/api/cart/${userId}/item/${annId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      alert('Ошибка удаления из корзины');
    }
  };

  // Покупка выбранных товаров
  const handlePurchase = async () => {
    if (!userId || selectedToBuy.length === 0) return;
    try {
      const res = await axios.post(
        `/api/cart/${userId}/purchase`,
        JSON.stringify(selectedToBuy),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      alert(`Покупка успешна! Списано: ${res.data.total} ₽`);
      setSelectedToBuy([]);
      fetchCart();
    } catch (err) {
      let backendMsg = '';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          backendMsg = err.response.data;
        } else if (err.response.data.message) {
          backendMsg = err.response.data.message;
        } else if (err.response.data.error) {
          backendMsg = err.response.data.error;
        }
      }
      alert('Ошибка оплаты' + (backendMsg ? `: ${backendMsg}` : ''));
    }
  };

  useEffect(() => {
    fetchTop();
    fetchCart(); // <-- добавлено, чтобы корзина была актуальна при первом рендере
  }, [userId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  // Проверка: находится ли товар в корзине
  const isInCart = (annId) => cartItems.some(item => item.id === annId);

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
        {token && (
          <button
            className="dashboard-create-btn"
            onClick={() => navigate('/announcement/create')}
          >
            + Новый товар
          </button>
        )}
        <button
          className="dashboard-refresh-btn"
          onClick={fetchTop}
          title="Обновить список"
        >
          ⟳
        </button>
        {token && (
          <button
            className="dashboard-profile-btn"
            onClick={() => navigate('/profile')}
          >
            Профиль
          </button>
        )}
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
                  {token && (
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
                  )}
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
      {/* Кнопка корзины внизу */}
      {token && (
        <button
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1001,
            background: '#185a9d',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            fontSize: 28,
            boxShadow: '0 4px 16px rgba(24,90,157,0.15)',
            cursor: 'pointer'
          }}
          onClick={handleOpenCart}
          title="Корзина"
        >
          🛒
        </button>
      )}
      {/* Модальное окно корзины */}
      {token && cartOpen && (
        <div style={{
          position: 'fixed',
          left: 0, top: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            minWidth: 340,
            maxWidth: 420,
            padding: 24,
            boxShadow: '0 8px 32px rgba(24,90,157,0.13)',
            position: 'relative'
          }}>
            <button
              onClick={() => setCartOpen(false)}
              style={{
                position: 'absolute', right: 12, top: 12,
                background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer'
              }}
              title="Закрыть"
            >✕</button>
            <h3 style={{ marginBottom: 16, color: '#185a9d' }}>Корзина</h3>
            {cartLoading ? (
              <div style={{ color: '#888', textAlign: 'center' }}>Загрузка...</div>
            ) : cartError ? (
              <div style={{ color: '#e53e3e', textAlign: 'center' }}>{cartError}</div>
            ) : cartItems.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center' }}>Корзина пуста</div>
            ) : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {cartItems.map(item => {
                    const checked = selectedToBuy.includes(item.id);
                    const discountedPrice = item.discount > 0
                      ? Math.round(item.price * (1 - item.discount / 100))
                      : item.price;
                    return (
                      <li key={item.id} style={{
                        borderBottom: '1px solid #e2e8f0',
                        padding: '0.7rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              setSelectedToBuy(sel =>
                                e.target.checked
                                  ? [...sel, item.id]
                                  : sel.filter(id => id !== item.id)
                              );
                            }}
                            style={{ marginRight: 10 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ color: '#888', fontSize: 14 }}>
                              {item.discount > 0 ? (
                                <>
                                  <span style={{ textDecoration: 'line-through', marginRight: 6 }}>{item.price} ₽</span>
                                  <span style={{ color: '#43cea2', fontWeight: 700 }}>{discountedPrice} ₽</span>
                                </>
                              ) : (
                                <span>{item.price} ₽</span>
                              )}
                            </div>
                          </div>
                        </label>
                        <button
                          style={{
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleRemoveFromCart(item.id)}
                          title="Удалить из корзины"
                        >
                          Удалить
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    style={{
                      background: '#43cea2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 22px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: selectedToBuy.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: selectedToBuy.length === 0 ? 0.6 : 1
                    }}
                    disabled={selectedToBuy.length === 0}
                    onClick={handlePurchase}
                  >
                    Оплатить выбранное
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
