// src/api/auth.js
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: false, // true, если используете куки
});

// Вот здесь, сразу после создания API, и подключаем перехватчики:
API.interceptors.request.use(config => {
  console.log('[Axios Request]', config.method, config.url, config);
  return config;
});

API.interceptors.response.use(
  response => {
    console.log('[Axios Response]', response);
    return response;
  },
  error => {
    console.log('[Axios Error]', {
      message: error.message,
      request: error.request,      // ушёл ли запрос
      response: error.response,    // если пришёл ответ
    });
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await API.post('/user/login', { email, password });
    return { token: response.data.token };
  } catch (error) {
    console.error('API login error:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response) {
      throw new Error(
        `Ошибка ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
    } else {
      throw new Error(error.message);
    }
  }
};

// Регистрация пользователя
export const register = async (userData) => {
  try {
    const response = await API.post('/user/register', userData);
    // Сервер возвращает { token: ... }
    return { token: response.data.token };
  } catch (error) {
    console.error('API register error:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response) {
      throw new Error(
        `Ошибка ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
    } else {
      throw new Error(error.message);
    }
  }
};
