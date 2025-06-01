import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [editingReviewRating, setEditingReviewRating] = useState(5);
  const [editingReviewError, setEditingReviewError] = useState('');
  const [editingReviewLoading, setEditingReviewLoading] = useState(false);
  const [reviewAuthors, setReviewAuthors] = useState({});
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
    axios.get(`/api/announcement/feedback/announcement/${id}`)
      .then(async res => {
        const reviewsArr = Array.isArray(res.data) ? res.data : [];
        setReviews(reviewsArr);

        // Получаем уникальные user_writer_id
        const uniqueWriterIds = [
          ...new Set(reviewsArr.map(r => r.user_writer_id).filter(Boolean))
        ];
        // Для каждого user_writer_id, если его нет в reviewAuthors, делаем запрос
        const missingIds = uniqueWriterIds.filter(uid => !(uid in reviewAuthors));
        if (missingIds.length > 0) {
          const promises = missingIds.map(uid =>
            axios.get(`/api/user/${uid}`).then(
              resp => ({ id: uid, name: resp.data.name, surname: resp.data.surname }),
              () => ({ id: uid, name: '', surname: '' })
            )
          );
          const authors = await Promise.all(promises);
          setReviewAuthors(prev => {
            const next = { ...prev };
            authors.forEach(a => { next[a.id] = a; });
            return next;
          });
        }
      })
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
      // Проверка и заполнение id
      if (!id) {
        setReviewError('Ошибка: не найден id объявления');
        setReviewLoading(false);
        return;
      }
      if (!userId) {
        setReviewError('Ошибка: не найден id пользователя');
        setReviewLoading(false);
        return;
      }
      const payload = {
        announcement_id: id,
        user_writer_id: userId,
        comment: reviewText,
        rating: reviewRating,
      };
      await axios.post(
        '/api/announcement/feedback',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewText('');
      setReviewRating(5);
      setReviewSuccess('Отзыв добавлен!');
      fetchReviews();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setReviewError(err.response.data.message);
      } else if (err.response && typeof err.response.data === 'string') {
        setReviewError(err.response.data);
      } else {
        setReviewError('Ошибка добавления отзыва');
      }
      console.error('[AnnouncementPage] Ошибка добавления отзыва:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Удаление отзыва
  const handleDeleteReview = async (reviewId) => {
    if (!token) return; // запрет для гостей
    if (!window.confirm('Удалить этот отзыв?')) return;
    try {
      await axios.delete(
        `/api/announcement/feedback/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      alert('Ошибка удаления отзыва');
      console.error('[AnnouncementPage] Ошибка удаления отзыва:', err);
    }
  };

  // Начать редактирование отзыва
  const handleEditReview = (review) => {
    if (!token) return; // запрет для гостей
    setEditingReviewId(review.id);
    setEditingReviewText(review.comment);
    setEditingReviewRating(review.rating);
    setEditingReviewError('');
  };

  // Отмена редактирования
  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditingReviewText('');
    setEditingReviewRating(5);
    setEditingReviewError('');
  };

  // Сохранить изменения отзыва
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setEditingReviewError('');
    setEditingReviewLoading(true);
    try {
      // Используем PATCH вместо PUT
      await axios.patch(
        `/api/announcement/feedback/${editingReviewId}`,
        {
          comment: editingReviewText,
          rating: editingReviewRating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingReviewId(null);
      setEditingReviewText('');
      setEditingReviewRating(5);
      fetchReviews();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setEditingReviewError(err.response.data.message);
      } else if (err.response && typeof err.response.data === 'string') {
        setEditingReviewError(err.response.data);
      } else {
        setEditingReviewError('Ошибка обновления отзыва');
      }
      console.error('[AnnouncementPage] Ошибка обновления отзыва:', err);
    } finally {
      setEditingReviewLoading(false);
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

  // Можно ли оставить отзыв (не на свой товар)
  const isOwnAnnouncement = announcement && userId && announcement.user_seller_id === userId;

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
        {/* Кнопка редактирования товара удалена */}
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
                          {/* Имя и фамилия автора отзыва как ссылка на профиль */}
                          {reviewAuthors[r.user_writer_id]
                            ? (
                              <Link
                                to={`/user/${r.user_writer_id}`}
                                style={{ color: '#185a9d', textDecoration: 'underline', cursor: 'pointer' }}
                              >
                                {`${reviewAuthors[r.user_writer_id].name || ''} ${reviewAuthors[r.user_writer_id].surname || ''}`.trim()}
                              </Link>
                            )
                            : ''}
                        </span>
                        <span className="review-rating">{r.rating} ★</span>
                        {token && userId === r.user_writer_id && editingReviewId !== r.id && (
                          <>
                            <button
                              className="review-delete-btn"
                              onClick={() => handleDeleteReview(r.id)}
                              title="Удалить отзыв"
                            >✕</button>
                            <button
                              className="review-delete-btn"
                              style={{ color: '#185a9d' }}
                              onClick={() => handleEditReview(r)}
                              title="Редактировать отзыв"
                            >✎</button>
                          </>
                        )}
                      </div>
                      {editingReviewId === r.id ? (
                        token ? (
                          <form className="review-form" onSubmit={handleUpdateReview}>
                            <textarea
                              value={editingReviewText}
                              onChange={e => setEditingReviewText(e.target.value)}
                              required
                              rows={2}
                              maxLength={500}
                            />
                            <div className="review-form-bottom">
                              <label>
                                Оценка:&nbsp;
                                <select
                                  value={editingReviewRating}
                                  onChange={e => setEditingReviewRating(Number(e.target.value))}
                                >
                                  {[5, 4, 3, 2, 1].map(n => (
                                    <option key={n} value={n}>{n} ★</option>
                                  ))}
                                </select>
                              </label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" disabled={editingReviewLoading || !editingReviewText.trim()}>
                                  {editingReviewLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button type="button" onClick={handleCancelEditReview} style={{ background: '#bdbdbd' }}>
                                  Отмена
                                </button>
                              </div>
                            </div>
                            {editingReviewError && <div className="review-error">{editingReviewError}</div>}
                          </form>
                        ) : (
                          <div className="review-text">{r.comment}</div>
                        )
                      ) : (
                        <>
                          <div className="review-text">{r.comment}</div>
                          <div className="review-date">{r.created_at ? r.created_at.slice(0, 16).replace('T', ' ') : ''}</div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )
          }
          {/* Добавить отзыв */}
          {token && !editingReviewId && !isOwnAnnouncement && (
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
          {/* Сообщение если пытается оставить отзыв на свой товар */}
          {token && !editingReviewId && isOwnAnnouncement && (
            <div className="review-error" style={{ marginTop: 12 }}>
              Нельзя оставлять отзыв на свой товар
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
