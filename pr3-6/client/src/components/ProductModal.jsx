import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, initialUser, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialUser?.name ?? '');
    setCategory(initialUser?.category ?? '');
    setDescription(initialUser?.description ?? '');
    setPrice(initialUser?.price != null ? String(initialUser.price) : '');
    setStock(initialUser?.stock != null ? String(initialUser.stock) : '');
    setImage(initialUser?.image ?? '');
  }, [open, initialUser]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Редактировать товар' : 'Новый товар';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !category.trim() || !description.trim()) {
      alert('Заполните все поля');
      return;
    }
    
    const numPrice = Number(price);
    const numStock = Number(stock);
    
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }
    
    if (!Number.isInteger(numStock) || numStock < 0) {
      alert('Количество должно быть целым числом');
      return;
    }

    onSubmit({
      id: initialUser?.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: numPrice,
      stock: numStock,
      image: image.trim() || `https://via.placeholder.com/150/b71c1c/ffffff?text=${encodeURIComponent(name.trim())}`
    });
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>
        
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название
            <input className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </label>
          
          <label className="label">
            Категория
            <input className="input" value={category} onChange={e => setCategory(e.target.value)} />
          </label>
          
          <label className="label">
            Описание
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} />
          </label>
          
          <label className="label">
            Цена
            <input className="input" type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </label>
          
          <label className="label">
            Количество
            <input className="input" type="number" value={stock} onChange={e => setStock(e.target.value)} />
          </label>

          <label className="label">
            URL фото (необязательно)
            <input className="input" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
          </label>
          
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn--primary">
              {mode === 'edit' ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}