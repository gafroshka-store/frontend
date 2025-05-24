import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AnnouncementPage.css';

const categoryMap = {
  1: 'Электроника',
  2: 'Одежда',
  3: 'Дом и сад',
  4: 'Детские товары',
  5: 'Авто',
  6: 'Спорт',
  7: 'Другое'
};

export default function AnnouncementPage() {
  const { id } = useParams();
  const { userId, token } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const navigate = useNavigate();

  // Получение товара
  useEffect(() => {
    setLoading(true);
    axios.get(`/api/announcement/${id}`)
      .then(res => setAnnouncement(res.data))
      .catch(err => {
        setError('Ошибка загрузки товара');
        console.error('[AnnouncementPage] Ошибка загрузки:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Получение отзывов
  const fetchReviews = () => {
    if (!id) return;
    setReviewsLoading(true);
    axios.get(`/api/feedback/announcement/${id}`)
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setReviews([]);
        console.error('[AnnouncementPage] Ошибка загрузки отзывов:', err);
      })
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [id]);

  // Добавление отзыва
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);
    try {
      const payload = {
        announcement_id: id,
        user_writer_id: userId,
        comment: reviewText,
        rating: reviewRating,
      };
      await axios.post(
        '/api/feedback',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewText('');
      setReviewRating(5);
      setReviewSuccess('Отзыв добавлен!');
      fetchReviews();
    } catch (err) {
      setReviewError('Ошибка добавления отзыва');
      console.error('[AnnouncementPage] Ошибка добавления отзыва:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Удаление отзыва
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Удалить этот отзыв?')) return;
    try {
      await axios.delete(
        `/api/feedback/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      alert('Ошибка удаления отзыва');
      console.error('[AnnouncementPage] Ошибка удаления отзыва:', err);
    }
  };

  if (error) return <div className="announcement-error">{error}</div>;
  if (loading) return <div className="announcement-loading">Пожалуйста, ожидайте...</div>;
  if (!announcement) return <div className="announcement-loading">Загрузка...</div>;

  // Цена со скидкой
  const hasDiscount = announcement.discount > 0;
  const discountedPrice = hasDiscount
    ? Math.round(announcement.price * (1 - announcement.discount / 100))
    : announcement.price;

  return (
    <div className="announcement-view-container">
      <button className="announcement-back-btn" onClick={() => navigate(-1)}>Назад</button>
      <div className="announcement-view-card">
        <h2>{announcement.name}</h2>
        <div className="announcement-view-desc">{announcement.description}</div>
        <div className="announcement-view-meta">
          <span>
            Цена:&nbsp;
            {hasDiscount ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                  {announcement.price} ₽
                </span>
                <span style={{ color: '#43cea2', fontWeight: 700 }}>
                  {discountedPrice} ₽
                </span>
              </>
            ) : (
              <span>{announcement.price} ₽</span>
            )}
          </span>
          <span>Категория: {categoryMap[announcement.category] || announcement.category}</span>
          <span>Скидка: {announcement.discount}%</span>
        </div>
        <div className="announcement-view-meta">
          <span>Рейтинг: {announcement.rating} ★</span>
          <span>Оценок: {announcement.rating_count}</span>
        </div>
        <div className="announcement-view-date">
          Добавлено: {announcement.created_at ? announcement.created_at.slice(0, 10) : ''}
        </div>
        <button
          className="announcement-edit-btn"
          onClick={() => navigate(`/announcement/${id}/edit`)}
        >
          Редактировать
        </button>
        {/* Отзывы */}
        <div className="reviews-section">
          <h3>Отзывы</h3>
          {reviewsLoading
            ? <div className="review-empty">Пожалуйста, ожидайте...</div>
            : reviews.length === 0
              ? <div className="review-empty">Пока нет отзывов</div>
              : (
                <ul className="review-list">
                  {reviews.map(r => (
                    <li key={r.id} className="review-item">
                      <div className="review-header">
                        <span className="review-author">
                          {r.user_name || r.user_writer_name || ''} {r.user_surname || r.user_writer_surname || ''}
                        </span>
                        <span className="review-rating">{r.rating} ★</span>
                        {userId === r.user_writer_id && (
                          <button
                            className="review-delete-btn"
                            onClick={() => handleDeleteReview(r.id)}
                            title="Удалить отзыв"
                          >✕</button>
                        )}
                      </div>
                      <div className="review-text">{r.comment}</div>
                      <div className="review-date">{r.created_at ? r.created_at.slice(0, 16).replace('T', ' ') : ''}</div>
                    </li>
                  ))}
                </ul>
              )
          }
          {/* Добавить отзыв */}
          {token && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Ваш отзыв..."
                required
                rows={2}
                maxLength={500}
              />
              <div className="review-form-bottom">
                <label>
                  Оценка:&nbsp;
                  <select
                    value={reviewRating}
                    onChange={e => setReviewRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </label>
                <button type="submit" disabled={reviewLoading || !reviewText.trim()}>
                  {reviewLoading ? 'Пожалуйста, ожидайте...' : 'Оставить отзыв'}
                </button>
              </div>
              {reviewError && <div className="review-error">{reviewError}</div>}
              {reviewSuccess && <div className="review-success">{reviewSuccess}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
