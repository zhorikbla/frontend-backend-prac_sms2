// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import './UsersPage.scss';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getUsers();
      console.log('Загружены пользователи:', data);
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      alert('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    if (!newRole) {
      console.error('Роль не выбрана');
      return;
    }
    
    console.log(`Обновление роли: пользователь ${id}, новая роль ${newRole}`);
    setUpdating(true);
    
    try {
      const response = await userApi.updateUser(id, { role: newRole });
      console.log('Ответ сервера:', response);
      
      // Обновляем локальный список
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: newRole } : u
      ));
      
      setEditingUser(null);
      setSelectedRole('');
      alert('Роль успешно обновлена!');
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      console.error('Детали ошибки:', error.response?.data);
      alert(`Ошибка: ${error.response?.data?.error || 'Не удалось обновить роль'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Удалить пользователя? Это действие необратимо.')) {
      try {
        await userApi.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        alert('Пользователь удален');
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Ошибка при удалении пользователя');
      }
    }
  };

  const startEdit = (userId, currentRole) => {
    setEditingUser(userId);
    setSelectedRole(currentRole);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Доступ запрещен</h2>
        <p>Эта страница доступна только администраторам.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Загрузка пользователей...</div>;

  return (
    <div className="users-page">
      <div className="container">
        <div className="toolbar">
          <h1 className="title">Управление пользователями</h1>
          <button className="btn btn--refresh" onClick={loadUsers}>
            🔄 Обновить
          </button>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>
                    {editingUser === u.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="role-select"
                        disabled={updating}
                      >
                        <option value="user">Пользователь</option>
                        <option value="seller">Продавец</option>
                        <option value="admin">Администратор</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'admin' ? 'Администратор' : 
                         u.role === 'seller' ? 'Продавец' : 
                         'Пользователь'}
                      </span>
                    )}
                  </td>
                  <td className="actions">
                    {editingUser === u.id ? (
                      <>
                        <button
                          className="btn btn--success"
                          onClick={() => handleUpdateRole(u.id, selectedRole)}
                          disabled={updating}
                        >
                          {updating ? 'Сохранение...' : '💾 Сохранить'}
                        </button>
                        <button
                          className="btn btn--secondary"
                          onClick={cancelEdit}
                          disabled={updating}
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn--edit"
                          onClick={() => startEdit(u.id, u.role)}
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? "Нельзя изменить свою роль" : "Изменить роль"}
                        >
                          Изменить роль
                        </button>
                        <button
                          className="btn btn--danger"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user?.id}
                          title={u.id === user?.id ? "Нельзя удалить себя" : "Удалить пользователя"}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;