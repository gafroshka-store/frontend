import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './CreateAnnouncementPage.css';

const initialState = {
  name: '',
  description: '',
  price: '',
  category: '',
  discount: '',
};

const categories = [
  { id: 1, label: 'Электроника' },
  { id: 2, label: 'Одежда' },
  { id: 3, label: 'Дом и сад' },
  { id: 4, label: 'Детские товары' },
  { id: 5, label: 'Авто' },
  { id: 6, label: 'Спорт' },
  { id: 7, label: 'Другое' }
];

export default function CreateAnnouncementPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, userId } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        user_seller_id: userId,
        price: parseInt(form.price, 10),
        category: parseInt(form.category, 10),
        discount: form.discount ? parseInt(form.discount, 10) : 0,
      };
      console.log('[CreateAnnouncementPage] POST /api/announcement', payload);

      await axios.post('/api/announcement', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Товар успешно создан!');
      setTimeout(() => navigate('/profile'), 1200);
      console.log('[CreateAnnouncementPage] Товар создан');
    } catch (err) {
      setError('Ошибка создания товара');
      console.error('[CreateAnnouncementPage] Ошибка создания:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="create-announcement-container">
        <div className="error-message">Только авторизованные пользователи могут создавать товары.</div>
      </div>
    );
  }

  return (
    <div className="create-announcement-container">
      <form className="create-announcement-form" onSubmit={handleSubmit}>
        <h2>Создать товар</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Название *"
            required
          />
        </div>
        <div className="input-group">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Описание *"
            required
            rows={4}
          />
        </div>
        <div className="input-group">
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={handleChange}
            placeholder="Цена (₽) *"
            required
          />
        </div>
        <div className="input-group">
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Категория *</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <input
            name="discount"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.discount}
            onChange={handleChange}
            placeholder="Скидка (%)"
          />
        </div>
        <button type="submit" className="create-announcement-button" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
        </button>
      </form>
    </div>
  );
}
