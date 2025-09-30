import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../services/products';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 8, featured: true });
      setFeaturedProducts(response.data || []);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">{t('hero.title')}</h1>
              <p className="hero-subtitle">{t('hero.subtitle')}</p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary btn-outline btn-lg ">
                  {t('hero.cta')}
                </Link>
                <Link to="/register?role=seller" className="btn btn-primary btn-outline btn-lg " style={{ color: "#white" }}>
                  {t('hero.becomeSellerCta')}
                </Link>
                
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-visual">
                <div className="hero-icon">🌾</div>
                <div className="hero-icons">
                  <span>🥕</span>
                  <span>🎨</span>
                  <span>🏺</span>
                  <span>🧺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Rural Marketplace?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh & Authentic</h3>
              <p>Direct from farmers and artisans, ensuring the freshest products and authentic handmade crafts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Fair Trade</h3>
              <p>Support rural communities by ensuring fair prices for producers without middlemen.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Connect rural producers with customers worldwide through our multilingual platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Quality Assured</h3>
              <p>Verified sellers and quality products with reviews and ratings from real customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('products.featured')}</h2>
            <Link to="/products" className="view-all-btn">
              View All Products →
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="no-products">
                  <p>No featured products available at the moment.</p>
                  <Link to="/products" className="btn btn-primary">
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/products?category=fresh-food" className="category-card">
              <div className="category-icon">🥬</div>
              <h3>Fresh Food</h3>
              <p>Farm-fresh vegetables, fruits, and organic produce</p>
            </Link>
            <Link to="/products?category=handmade-crafts" className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Handmade Crafts</h3>
              <p>Unique handcrafted items and traditional artworks</p>
            </Link>
            <Link to="/products?category=local-art" className="category-card">
              <div className="category-icon">🖼️</div>
              <h3>Local Art</h3>
              <p>Beautiful paintings, sculptures, and cultural art</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of customers discovering authentic rural products, or become a seller and reach a global audience.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join as Customer
              </Link>
              <Link to="/register?role=seller" className="btn btn-secondary btn-lg">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home {
          min-height: 100vh;
        }

        .hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: var(--text-light);
          padding: 4rem 0;
          margin-bottom: 4rem;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          min-height: 60vh;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hero-icon {
          font-size: 8rem;
          margin-bottom: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        .hero-icons {
          display: flex;
          gap: 1rem;
        }

        .hero-icons span {
          font-size: 3rem;
          animation: bounce 2s ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        .hero-icons span:nth-child(1) { --delay: 0s; }
        .hero-icons span:nth-child(2) { --delay: 0.2s; }
        .hero-icons span:nth-child(3) { --delay: 0.4s; }
        .hero-icons span:nth-child(4) { --delay: 0.6s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .features {
          margin-bottom: 4rem;
        }

        .section-title {
          text-align: center;
          margin-bottom: 3rem;
          font-size: 2.5rem;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2rem;
          border-radius: 12px;
          background-color: var(--surface-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .featured-products {
          margin-bottom: 4rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .view-all-btn {
          color: var(--primary-color);
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .view-all-btn:hover {
          color: var(--primary-light);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .product-skeleton {
          background-color: var(--surface-color);
          border-radius: 12px;
          padding: 1rem;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-image {
          width: 100%;
          height: 200px;
          background-color: var(--border-color);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .skeleton-text {
          height: 1rem;
          background-color: var(--border-color);
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-text.short {
          width: 60%;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
        }

        .categories {
          margin-bottom: 4rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .category-card {
          background-color: var(--surface-color);
          border-radius: 12px;
          padding: 2rem;
          text-decoration: none;
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .category-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .category-card h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .cta-section {
          background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-light) 100%);
          color: var(--text-light);
          padding: 4rem 0;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .features-grid,
          .categories-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;