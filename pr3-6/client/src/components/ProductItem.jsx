import React, { useState } from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="productCard">
      <div className="productImage" data-name={product.name}>
        {!imageError && (
          <img 
            src={product.image} 
            alt={product.name}
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="productContent">
        <div className="productHeader">
          <span className="productId">#{product.id}</span>
          <span className="productCategory">{product.category}</span>
        </div>
        
        <div className="productBody">
          <h3 className="productName">{product.name}</h3>
          <p className="productDesc">{product.description}</p>
        </div>
        
        <div className="productFooter">
          <div>
            <span className="productPrice">{product.price.toLocaleString()} ₽</span>
            <span className="productStock"> / {product.stock} шт.</span>
          </div>
          <div className="productActions">
            <button className="btn" onClick={() => onEdit(product)}>✎</button>
            <button className="btn btn--danger" onClick={() => onDelete(product.id)}>✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}