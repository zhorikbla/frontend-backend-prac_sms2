// src/components/ProductModal.jsx
import React, { useState, useEffect } from 'react';

const ProductModal = ({ open, mode, initialProduct, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    rating: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Заполняем форму при открытии
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialProduct) {
        console.log('📝 Редактирование товара:', initialProduct);
        setFormData({
          name: initialProduct.name || '',
          category: initialProduct.category || '',
          description: initialProduct.description || '',
          price: initialProduct.price || '',
          stock: initialProduct.stock || '',
          rating: initialProduct.rating || '',
          image: initialProduct.image || ''
        });
      } else {
        // Сброс формы для создания
        setFormData({
          name: '',
          category: '',
          description: '',
          price: '',
          stock: '',
          rating: '',
          image: ''
        });
      }
      setError('');
      setSubmitting(false);
    }
  }, [open, mode, initialProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Название товара обязательно');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Категория обязательна');
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Цена должна быть больше 0');
      return false;
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      setError('Количество на складе должно быть неотрицательным');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Подготовка данных для отправки
      const submitData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description?.trim() || '',
        image: formData.image?.trim() || '/images/default.jpg'
      };

      if (formData.price !== '') {
        submitData.price = parseFloat(formData.price);
      }

      if (formData.stock !== '') {
        submitData.stock = parseInt(formData.stock, 10);
      }

      if (formData.rating !== '') {
        submitData.rating = parseFloat(formData.rating);
      }
      
      
      // Если это редактирование, передаем данные с id
      if (mode === 'edit' && initialProduct?.id) {
        await onSubmit(submitData);
      } else {
        await onSubmit(submitData);
      }
      
      // Закрываем модалку после успешного сохранения
      onClose();
    } catch (err) {
      console.error('❌ Ошибка сохранения:', err);
      setError(err.response?.data?.error || 'Ошибка при сохранении товара');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">
            {mode === 'create' ? '➕ Создать товар' : '✏️ Редактировать товар'}
          </div>
          <button className="iconBtn" onClick={onClose} disabled={submitting}>
            ✕
          </button>
        </div>
        
        <form className="form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <label className="label">
            <span className="label-text">Название товара *</span>
            <input 
              className="input" 
              type="text"
              name="name"
              value={formData.name} 
              onChange={handleChange}
              placeholder="Введите название товара"
              required 
              disabled={submitting}
              autoFocus
            />
          </label>
          
          <label className="label">
            <span className="label-text">Категория *</span>
            <input 
              className="input" 
              type="text"
              name="category"
              value={formData.category} 
              onChange={handleChange}
              placeholder="Например: Ноутбуки, Смартфоны, Аксессуары"
              required 
              disabled={submitting}
            />
          </label>
          
          <label className="label">
            <span className="label-text">Описание</span>
            <textarea 
              className="input" 
              name="description"
              value={formData.description} 
              onChange={handleChange}
              placeholder="Подробное описание товара..."
              rows="4"
              disabled={submitting}
              style={{ resize: 'vertical' }}
            />
          </label>
          
          <div className="form-row">
            <label className="label half">
              <span className="label-text">Цена (₽) *</span>
              <input 
                className="input" 
                type="number"
                name="price"
                value={formData.price} 
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                required 
                disabled={submitting}
              />
            </label>
            
            <label className="label half">
              <span className="label-text">Количество *</span>
              <input 
                className="input" 
                type="number"
                name="stock"
                value={formData.stock} 
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                required 
                disabled={submitting}
              />
            </label>
          </div>
          
          <div className="form-row">
            <label className="label half">
              <span className="label-text">Рейтинг (0-5)</span>
              <input 
                className="input" 
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating} 
                onChange={handleChange}
                placeholder="0"
                disabled={submitting}
              />
            </label>
            
            <label className="label half">
              <span className="label-text">URL изображения</span>
              <input 
                className="input" 
                type="text"
                name="image"
                value={formData.image} 
                onChange={handleChange}
                placeholder="/images/product.jpg"
                disabled={submitting}
              />
            </label>
          </div>
          
          {formData.image && (
            <div className="image-preview" style={{
              marginTop: '5px',
              padding: '8px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#666'
            }}>
              📷 Предпросмотр: {formData.image}
            </div>
          )}
          
          <div className="modal__footer">
            <button 
              type="button" 
              className="btn" 
              onClick={onClose} 
              disabled={submitting}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn--primary" 
              disabled={submitting}
            >
              {submitting ? 'Сохранение...' : (mode === 'create' ? 'Создать товар' : 'Сохранить изменения')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;