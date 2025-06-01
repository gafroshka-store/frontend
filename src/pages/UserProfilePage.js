import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function UserProfilePage() {
  const { id } = useParams();
  const { userId, token } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackSubmitLoading, setFeedbackSubmitLoading] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackText, setEditingFeedbackText] = useState('');
  const [editingFeedbackRating, setEditingFeedbackRating] = useState(5);
  const [editingFeedbackError, setEditingFeedbackError] = useState('');
  const [editingFeedbackLoading, setEditingFeedbackLoading] = useState(false);

  const navigate = useNavigate();

  // Функция для обновления профиля пользователя
  const fetchUser = () => {
    axios.get(`/api/user/${id}`)
      .then(res => setUser(res.data))
      .catch(() => setError('Ошибка загрузки профиля пользователя'));
  };

  useEffect(() => {
    if (!id) return;
    fetchUser();
  }, [id]);

  // Получение отзывов на пользователя
  const fetchFeedbacks = () => {
    setFeedbackLoading(true);
    setFeedbackError('');
    axios.get(`/api/user/feedback/user/${id}`)
      .then(res => {
        // Корректная обработка: если массив, то используем, иначе []
        if (Array.isArray(res.data)) {
          setFeedbacks(res.data);
        } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.feedbacks)) {
          setFeedbacks(res.data.feedbacks);
        } else {
          setFeedbacks([]);
        }
      })
      .catch((err) => {
        // Показываем ошибку только если это действительно ошибка сети/сервера
        if (err.response && err.response.status === 404) {
          setFeedbacks([]);
        } else {
          setFeedbackError('Ошибка загрузки отзывов о пользователе');
        }
      })
      .finally(() => setFeedbackLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, [id]);

  // Добавление отзыва на пользователя
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');
    setFeedbackSubmitLoading(true);
    try {
      await axios.post(
        '/api/user/feedback',
        {
          user_recipient_id: id,
          user_writer_id: userId,
          comment: feedbackText,
          rating: feedbackRating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackText('');
      setFeedbackRating(5);
      setFeedbackSuccess('Отзыв добавлен!');
      fetchFeedbacks();
      fetchUser(); // обновить профиль
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFeedbackError(err.response.data.message);
      } else if (err.response && typeof err.response.data === 'string') {
        setFeedbackError(err.response.data);
      } else {
        setFeedbackError('Ошибка добавления отзыва');
      }
    } finally {
      setFeedbackSubmitLoading(false);
    }
  };

  // Удаление отзыва на пользователя
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Удалить этот отзыв?')) return;
    try {
      await axios.delete(
        `/api/user/feedback/${feedbackId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {} // axios требует data для DELETE с body, даже если пустой объект
        }
      );
      fetchFeedbacks();
      fetchUser(); // обновить профиль
    } catch (err) {
      alert('Ошибка удаления отзыва');
    }
  };

  // Начать редактирование отзыва
  const handleEditFeedback = (feedback) => {
    setEditingFeedbackId(feedback.feedback_id);
    setEditingFeedbackText(feedback.comment);
    setEditingFeedbackRating(feedback.rating);
    setEditingFeedbackError('');
  };

  // Отмена редактирования
  const handleCancelEditFeedback = () => {
    setEditingFeedbackId(null);
    setEditingFeedbackText('');
    setEditingFeedbackRating(5);
    setEditingFeedbackError('');
  };

  // Сохранить изменения отзыва
  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    setEditingFeedbackError('');
    setEditingFeedbackLoading(true);
    try {
      await axios.put(
        `/api/user/feedback/${editingFeedbackId}`,
        {
          comment: editingFeedbackText,
          rating: editingFeedbackRating,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingFeedbackId(null);
      setEditingFeedbackText('');
      setEditingFeedbackRating(5);
      fetchFeedbacks();
      fetchUser(); // обновить профиль
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setEditingFeedbackError(err.response.data.message);
      } else if (err.response && typeof err.response.data === 'string') {
        setEditingFeedbackError(err.response.data);
      } else {
        setEditingFeedbackError('Ошибка обновления отзыва');
      }
    } finally {
      setEditingFeedbackLoading(false);
    }
  };

  if (error) return <div style={{ padding: 32, color: '#e53e3e' }}>{error}</div>;
  if (!user) return <div style={{ padding: 32 }}>Загрузка...</div>;

  // Можно ли оставить отзыв (не на свой профиль, не оставляли ранее)
  const myFeedback = feedbacks.find(fb => fb.user_writer_id === userId);
  const canLeaveFeedback = token && userId && userId !== id && !myFeedback;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '2rem 1rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        maxWidth: 480,
        width: '100%',
        position: 'relative'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 16,
            top: 16,
            background: 'transparent',
            border: 'none',
            color: '#185a9d',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          ← Назад
        </button>
        <h2 style={{
          textAlign: 'center',
          color: '#2d3748',
          marginBottom: '0.5rem',
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '0.01em'
        }}>
          {user.name} {user.surname}
        </h2>
        <ul style={{ marginBottom: '1.5rem', padding: 0, listStyle: 'none' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '1.07rem' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>Дата рождения:</span>
            <span style={{ color: '#222', fontWeight: 500 }}>
              {user.day_of_birth && !user.day_of_birth.startsWith('0001-01-01')
                ? user.day_of_birth.slice(0, 10)
                : ''}
            </span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '1.07rem' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>Пол:</span>
            <span style={{ color: '#222', fontWeight: 500 }}>
              {user.sex === true ? 'Мужской' : user.sex === false ? 'Женский' : ''}
            </span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '1.07rem' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>Дата регистрации:</span>
            <span style={{ color: '#222', fontWeight: 500 }}>
              {user.registration_date && user.registration_date.slice(0, 10)}
            </span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '1.07rem' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>Сделок:</span>
            <span style={{ color: '#222', fontWeight: 500 }}>{user.deals_count}</span>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '1.07rem' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>Рейтинг:</span>
            <span style={{ color: '#222', fontWeight: 500 }}>
              {user.rating} <span style={{ color: '#f6c700' }}>★</span> ({user.rating_count})
            </span>
          </li>
        </ul>
        {/* Отзывы на пользователя */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#185a9d', marginBottom: 12, fontWeight: 700 }}>Отзывы о пользователе</h3>
          {feedbackLoading
            ? <div style={{ color: '#888', textAlign: 'center' }}>Пожалуйста, ожидайте...</div>
            : feedbacks.length === 0
              ? <div style={{ color: '#888', textAlign: 'center' }}>Пока нет отзывов</div>
              : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {feedbacks.map(fb => (
                    <li key={fb.feedback_id} style={{
                      background: '#f8fafc',
                      borderRadius: '0.6rem',
                      padding: '0.7rem 1rem 0.5rem 1rem',
                      marginBottom: '0.7rem',
                      boxShadow: '0 1px 4px rgba(67, 206, 162, 0.06)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, color: '#185a9d' }}>
                        <span style={{ flex: 1 }}>
                          {fb.user_writer_id === userId ? 'Вы' : `Пользователь: ${fb.user_writer_id}`}
                        </span>
                        <span style={{ color: '#f6c700', fontWeight: 700 }}>{fb.rating} ★</span>
                        {token && userId === fb.user_writer_id && editingFeedbackId !== fb.feedback_id && (
                          <>
                            <button
                              style={{ background: 'transparent', border: 'none', color: '#e53e3e', fontSize: '1.1rem', cursor: 'pointer', marginLeft: 8, fontWeight: 700 }}
                              onClick={() => handleDeleteFeedback(fb.feedback_id)}
                              title="Удалить отзыв"
                            >✕</button>
                            <button
                              style={{ background: 'transparent', border: 'none', color: '#185a9d', fontSize: '1.1rem', cursor: 'pointer', marginLeft: 4, fontWeight: 700 }}
                              onClick={() => handleEditFeedback(fb)}
                              title="Редактировать отзыв"
                            >✎</button>
                          </>
                        )}
                      </div>
                      {editingFeedbackId === fb.feedback_id ? (
                        token ? (
                          <form onSubmit={handleUpdateFeedback} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <textarea
                              value={editingFeedbackText}
                              onChange={e => setEditingFeedbackText(e.target.value)}
                              required
                              rows={2}
                              maxLength={500}
                              style={{ borderRadius: 8, border: '1px solid #e2e8f0', padding: 8, fontSize: 16 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                              <label>
                                Оценка:&nbsp;
                                <select
                                  value={editingFeedbackRating}
                                  onChange={e => setEditingFeedbackRating(Number(e.target.value))}
                                  style={{ fontSize: 16, borderRadius: 6, border: '1px solid #e2e8f0', padding: '2px 10px', marginLeft: 4 }}
                                >
                                  {[5, 4, 3, 2, 1].map(n => (
                                    <option key={n} value={n}>{n} ★</option>
                                  ))}
                                </select>
                              </label>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" disabled={editingFeedbackLoading || !editingFeedbackText.trim()} style={{ background: '#43cea2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}>
                                  {editingFeedbackLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button type="button" onClick={handleCancelEditFeedback} style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}>
                                  Отмена
                                </button>
                              </div>
                            </div>
                            {editingFeedbackError && <div style={{ color: '#e53e3e', marginTop: 4, textAlign: 'center' }}>{editingFeedbackError}</div>}
                          </form>
                        ) : (
                          <div style={{ margin: '8px 0 0 0', color: '#222', fontSize: 16 }}>{fb.comment}</div>
                        )
                      ) : (
                        <div style={{ margin: '8px 0 0 0', color: '#222', fontSize: 16 }}>{fb.comment}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )
          }
          {/* Добавить отзыв */}
          {canLeaveFeedback && (
            <form onSubmit={handleFeedbackSubmit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Ваш отзыв о пользователе..."
                required
                rows={2}
                maxLength={500}
                style={{ borderRadius: 8, border: '1px solid #e2e8f0', padding: 8, fontSize: 16 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <label>
                  Оценка:&nbsp;
                  <select
                    value={feedbackRating}
                    onChange={e => setFeedbackRating(Number(e.target.value))}
                    style={{ fontSize: 16, borderRadius: 6, border: '1px solid #e2e8f0', padding: '2px 10px', marginLeft: 4 }}
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </label>
                <button type="submit" disabled={feedbackSubmitLoading || !feedbackText.trim()} style={{ background: '#43cea2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}>
                  {feedbackSubmitLoading ? 'Пожалуйста, ожидайте...' : 'Оставить отзыв'}
                </button>
              </div>
              {feedbackError && <div style={{ color: '#e53e3e', marginTop: 4, textAlign: 'center' }}>{feedbackError}</div>}
              {feedbackSuccess && <div style={{ color: '#38a169', marginTop: 4, textAlign: 'center' }}>{feedbackSuccess}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
