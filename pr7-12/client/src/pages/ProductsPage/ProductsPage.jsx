// src/pages/ProductsPage/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductsPage.scss';
import ProductModal from '../../components/ProductModal';
import { api } from '../../api';
import AuthModal from '../../components/AuthModal';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // для просмотра товара
  const [viewModalOpen, setViewModalOpen] = useState(false); // модалка просмотра
  
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isSeller,
    canCreateProducts,
    canEditProducts, 
    canDeleteProducts,
    getRoleText,
    logout 
  } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        logout();
        openAuthModal(true);
      } else {
        alert('Ошибка загрузки товаров');
      }
    } finally {
      setLoading(false);
    }
  };

  // Открытие модалки для создания/редактирования
  const openProductModal = (isEditMode, product = null) => {
    setModalMode(isEditMode ? "edit" : "create");
    setEditingProduct(product);
    setModalOpen(true);
  };

  // Открытие модалки для просмотра товара
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedProduct(null);
  };

  const openAuthModal = (isLogin) => {
    setIsLoginMode(isLogin);
    setAuthModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openCreate = () => {
    openProductModal(false);
  };

  const openEdit = (product) => {
    openProductModal(true, product);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        logout();
        openAuthModal(true);
      } else if (err.response?.status === 403) {
        alert('У вас недостаточно прав для удаления товара');
      } else {
        alert('Ошибка удаления товара');
      }
    }
  };

  const handleAuthSuccess = async () => {
    closeAuthModal();
    loadProducts();
  };

  const handleLogout = () => {
    logout();
  };

  // src/pages/ProductsPage/ProductsPage.jsx
const handleSubmitModal = async (payload) => {
  try {
    let result;

    if (modalMode === 'create') {
      result = await api.createProduct(payload);

      setProducts(prev => [...prev, result]);

    } else {
      // 🔥 ВАЖНО: используем id из editingProduct
      result = await api.updateProduct(editingProduct.id, payload);

      // 🔥 ВАЖНО: обновляем через перезагрузку
      await loadProducts(); // ← ГЛАВНЫЙ ФИКС
    }

    closeModal();

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || 'Ошибка сохранения');
  }
};
  // Компонент карточки товара
  const ProductCard = ({ product }) => (
    <div className="productCard">
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
            {/* Кнопка просмотра - доступна всем авторизованным */}
            <button 
              className="btn btn--view" 
              onClick={() => openViewModal(product)}
            >
              Просмотр
            </button>
            
            {/* Кнопка редактирования - только для продавцов и админов */}
            {canEditProducts && (
              <button 
                className="btn btn--edit" 
                onClick={() => openEdit(product)}
              >
                Редактировать
              </button>
            )}
            
            {/* Кнопка удаления - только для админов */}
            {canDeleteProducts && (
              <button 
                className="btn btn--danger" 
                onClick={() => handleDelete(product.id)}
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Blade</div>
          
          <div className="header-right">
            {isAuthenticated ? (
              <div className="user-info">
                <span className={`user-role-badge role-${user?.role}`}>
                  {getRoleText()}
                </span>
                <span className="username">{user?.username}</span>
                
                {/* Ссылка на управление пользователями (только для админа) */}
                {isAdmin && (
                  <Link to="/users" className="btn btn--admin">
                    👥 Пользователи
                  </Link>
                )}
                
                <button className="btn btn--logout" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            ) : (
              <div className="auth-btns">
                <button className="btn btn--auth" onClick={() => openAuthModal(true)}>
                  Вход
                </button>
                <button className="btn btn--reg" onClick={() => openAuthModal(false)}>
                  Регистрация
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Товары</h1>
            
            {/* Кнопка создания товара - только для продавцов и админов */}
            {canCreateProducts && (
              <button className="btn btn--primary" onClick={openCreate}>
                + Создать товар
              </button>
            )}
          </div>

          <div className="search">
            <input
              type="text"
              className="search__input"
              placeholder="Поиск по названию, категории или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty">Загрузка товаров...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              {searchQuery ? 'Товары не найдены' : 'Товаров пока нет'}
            </div>
          ) : (
            <>
              <div className="results-info">
                Найдено: {filteredProducts.length} из {products.length}
              </div>
              
              <div className="list">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          Blade — интернет-магазин
        </div>
      </footer>

      {/* Модалка для создания/редактирования товара */}
      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />

      {/* Модалка для просмотра товара */}
      {viewModalOpen && selectedProduct && (
        <div className="backdrop" onClick={closeViewModal}>
          <div className="modal view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div className="modal__title">Детали товара</div>
              <button className="iconBtn" onClick={closeViewModal}>✕</button>
            </div>
            <div className="modal__body">
              <div className="product-detail">
                <div className="detail-image">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                  ) : (
                    <div className="no-image-large">📦</div>
                  )}
                </div>
                <div className="detail-info">
                  <h3>{selectedProduct.name}</h3>
                  <p className="category">Категория: {selectedProduct.category}</p>
                  <p className="price">Цена: {selectedProduct.price.toLocaleString()} ₽</p>
                  <p className="stock">В наличии: {selectedProduct.stock} шт.</p>
                  <p className="rating">Рейтинг: {selectedProduct.rating || 'Нет'} / 5</p>
                  <p className="description">
                    <strong>Описание:</strong><br/>
                    {selectedProduct.description || 'Нет описания'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              {canEditProducts && (
                <button 
                  className="btn btn--edit" 
                  onClick={() => {
                    closeViewModal();
                    openEdit(selectedProduct);
                  }}
                >
                  Редактировать
                </button>
              )}
              {canDeleteProducts && (
                <button 
                  className="btn btn--danger" 
                  onClick={() => {
                    closeViewModal();
                    handleDelete(selectedProduct.id);
                  }}
                >
                  Удалить
                </button>
              )}
              <button className="btn" onClick={closeViewModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={authModalOpen}
        isLogin={isLoginMode}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}