import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart, getItemQuantity } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const itemQuantity = getItemQuantity(product._id);

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img 
              src={`http://localhost:5000${product.images[0].url}`} 
              alt={product.images[0].alt || product.name}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEwxNDAgMTQwTTYwIDE0MEwxNDAgNjAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
              }}
            />
          ) : (
            <div className="product-placeholder">
              <span>📦</span>
            </div>
          )}
          {product.featured && (
            <div className="featured-badge">⭐ Featured</div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/products/${product._id}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        
        <p className="product-description">
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description
          }
        </p>

        <div className="product-meta">
          <span className="product-category">{t(`categories.${product.category}`)}</span>
          {product.seller && (
            <Link to={`/sellers/${product.seller._id}`} className="seller-link">
              by {product.seller.name}
            </Link>
          )}
        </div>

        <div className="product-footer">
          <div className="price-section">
            <span className="product-price">${product.price.toFixed(2)}</span>
            <span className="price-unit">/{product.inventory.unit}</span>
          </div>

          <div className="product-actions">
            {product.inventory.inStock ? (
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary btn-sm add-to-cart-btn"
              >
                {itemQuantity > 0 ? `In Cart (${itemQuantity})` : t('products.addToCart')}
              </button>
            ) : (
              <span className="out-of-stock">{t('products.outOfStock')}</span>
            )}
          </div>
        </div>

        {product.ratings.count > 0 && (
          <div className="product-rating">
            <span className="stars">
              {'★'.repeat(Math.floor(product.ratings.average))}
              {'☆'.repeat(5 - Math.floor(product.ratings.average))}
            </span>
            <span className="rating-text">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card {
          background-color: var(--surface-color);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .product-link {
          text-decoration: none;
        }

        .product-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-placeholder {
          width: 100%;
          height: 100%;
          background-color: var(--background-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--text-secondary);
        }

        .featured-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background-color: var(--warning-color);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .product-info {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-title {
          text-decoration: none;
          color: var(--text-primary);
        }

        .product-title h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .product-title:hover h3 {
          color: var(--primary-color);
        }

        .product-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
          flex: 1;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
        }

        .product-category {
          background-color: var(--background-color);
          color: var(--primary-color);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .seller-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .seller-link:hover {
          color: var(--primary-color);
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .price-section {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .price-unit {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .add-to-cart-btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .out-of-stock {
          color: var(--error-color);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .stars {
          color: var(--warning-color);
        }

        .rating-text {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .product-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }

          .add-to-cart-btn {
            width: 100%;
          }

          .product-meta {
            flex-direction: column;
            gap: 0.25rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;