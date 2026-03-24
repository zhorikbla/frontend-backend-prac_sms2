import React, { useState, useEffect } from 'react';
import { auth } from '../api'; // ✅ Импортируем auth из api

export function AuthModal({ open, isLogin, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsername('');
    setPassword('');
    setError('');
    setIsLoading(false);
  }, [open, isLogin]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ✅ Используем auth.login из api.js
        await auth.login(username, password);
        onSuccess();
      } else {
        // ✅ Используем auth.register из api.js
        await auth.register(username, password);
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      
      // Обработка ошибок
      if (error.response?.status === 409) {
        setError('Пользователь с таким логином уже существует');
      } else if (error.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.error || 'Заполните все поля');
      } else if (error.response?.status === 404) {
        setError('Пользователь не найден');
      } else {
        setError(error.response?.data?.error || 'Ошибка при авторизации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{isLogin ? 'Вход' : 'Регистрация'}</div>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>
        
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Логин
            <input 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              disabled={isLoading}
              autoFocus 
            />
          </label>
          
          <label className="label">
            Пароль
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={isLoading}
            />
          </label>

          {error && (
            <div style={{
              color: '#dc3545',
              fontSize: '14px',
              padding: '8px',
              backgroundColor: '#f8d7da',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose} disabled={isLoading}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;