import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './CreateAnnouncementPage.css';

const categories = [
  { id: 1, label: 'Электроника' },
  { id: 2, label: 'Одежда' },
  { id: 3, label: 'Дом и сад' },
  { id: 4, label: 'Детские товары' },
  { id: 5, label: 'Авто' },
  { id: 6, label: 'Спорт' },
  { id: 7, label: 'Другое' }
];

export default function EditAnnouncementPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[EditAnnouncementPage] GET /api/announcement/' + id);
    axios.get(`/api/announcement/${id}`)
      .then(res => {
        console.log('[EditAnnouncementPage] Response:', res);
        setForm(res.data);
      })
      .catch(err => {
        setError('Ошибка загрузки товара');
        console.error('[EditAnnouncementPage] Ошибка загрузки:', err);
      });
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      console.log('[EditAnnouncementPage] PUT /api/announcement/' + id, form);
      await axios.put(
        `/api/announcement/${id}`,
        {
          name: form.name,
          description: form.description,
          price: parseInt(form.price, 10),
          category: parseInt(form.category, 10),
          discount: form.discount ? parseInt(form.discount, 10) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Товар обновлён!');
      setTimeout(() => navigate(`/announcement/${id}`), 1000);
      console.log('[EditAnnouncementPage] Обновлено:', id);
    } catch (err) {
      setError('Ошибка обновления товара');
      console.error('[EditAnnouncementPage] Ошибка обновления:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!form) return <div className="announcement-loading">Загрузка...</div>;
  if (!token) {
    return (
      <div className="create-announcement-container">
        <div className="error-message">Только авторизованные пользователи могут редактировать товары.</div>
      </div>
    );
  }

  return (
    <div className="create-announcement-container">
      <form className="create-announcement-form" onSubmit={handleSubmit}>
        <h2>Редактировать товар</h2>
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
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
