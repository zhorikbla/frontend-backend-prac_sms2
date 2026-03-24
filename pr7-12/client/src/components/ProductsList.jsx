// src/components/ProductsList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ProductsList = ({ products, onEdit, onDelete, canEdit, canDelete }) => {
  if (!products || products.length === 0) {
    return <div className="empty">Нет товаров для отображения</div>;
  }

  return (
    <div className="list">
      {products.map((product) => (
        <div key={product.id} className="productCard">
          <div className="productCard__image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="no-image">📦</div>
            )}
          </div>
          
          <div className="productCard__content">
            <div className="productHeader">
              <span className="productId">#{product.id}</span>
              <span className="productCategory">{product.category}</span>
            </div>
            
            <div className="productBody">
              <h3 className="productName">{product.name}</h3>
              <p className="productDesc">{product.description || 'Нет описания'}</p>
            </div>
            
            <div className="productFooter">
              <div className="productPrice">
                {product.price.toLocaleString()} ₽
                <span className="productStock">(в наличии: {product.stock})</span>
              </div>
              
              <div className="productActions">
                <Link to={`/products/${product.id}`}>
                  <button className="btn btn--view">Просмотр</button>
                </Link>
                
                {/* Кнопка редактирования - только для продавцов и админов */}
                {canEdit && (
                  <button 
                    className="btn btn--edit" 
                    onClick={() => onEdit(product)}
                  >
                    Редактировать
                  </button>
                )}
                
                {/* Кнопка удаления - только для админов */}
                {canDelete && (
                  <button 
                    className="btn btn--danger" 
                    onClick={() => onDelete(product.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;